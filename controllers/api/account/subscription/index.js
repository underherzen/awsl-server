const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const { User, Subscription } = require('../../../../models');
const { STRIPE_STATUSES, STRIPE_CONSTANTS } = require('../../../../constants');
const { userToFront } = require('../../../../modules/helpers');

/**
 * this must be one of several endpoints that changes the `Subscription` table DIRECTLY
 * We must work with this table using only stripe webhooks
 * but sometimes we cannot avoid doing this
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const pauseSubscription = async (req, res, next) => {
  let user = req.user;
  const subscription = req.subscription;

  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });
  // and then change db record for returning to user
  await Subscription.update(
    { status: STRIPE_STATUSES.PAUSED, cancel_at_period_end: true },
    { where: { id: subscription.id } }
  );

  user = await userToFront(user.id);
  res.send({ user });
};

const resetSubscription = async (req, res, next) => {
  let user = req.user;
  const subscription = req.subscription;
  console.log(subscription);

  // if canceled
  if (subscription.status === STRIPE_STATUSES.CANCELED) {
    if (!subscription.last4) {
      res.status(400).send({ error: 'You should add CC details!' });
      return;
    }
    const product = {
      id: STRIPE_CONSTANTS.plans.annual_99, // NOTE: This is the ID for the plan, NOT the product, in stripe's API thingamajig (https://dashboard.stripe.com/plans/annual)
      name: STRIPE_CONSTANTS.name,
    };
    let coupon;
    if (subscription.coupon) {
      try {
        coupon = await stripe.coupons.retrieve(subscription.coupon);
      } catch (e) {}
    }
    const newSubscription = await stripe.subscriptions.create({
      customer: subscription.customer,
      items: [{ plan: product.id }],
      coupon: coupon ? coupon.id : '',
    });

    await Subscription.update(
      {
        id: newSubscription.id,
        status: newSubscription.status,
        cancel_at_period_end: newSubscription.cancel_at_period_end,
      },
      {
        where: {
          id: subscription.id,
        },
      }
    );
    user = await userToFront(user.id);
    res.send({ user });
    return;
  } else if (
    // if it's only on pause
    [STRIPE_STATUSES.PAUSED, STRIPE_STATUSES.ACTIVE, STRIPE_STATUSES.TRIALING].includes(
      subscription.status
    ) &&
    subscription.cancel_at_period_end === true
  ) {
    await Promise.all([
      stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: false,
      }),
      Subscription.update({ cancel_at_period_end: false }, { where: { id: subscription.id } }),
    ]);
    user = await userToFront(user.id);
    res.send({ user });
    return;
  } else if (subscription.status === STRIPE_STATUSES.PAST_DUE) {
    if (!subscription.last4) {
      res.status(400).send({ error: 'You should add CC details' });
      return;
    }
    await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: false,
    });
    await Subscription.update({ cancel_at_period_end: false }, { where: { id: subscription.id } });
    user = await userToFront(user.id);
    res.send({ user });
    return;
  }
  console.log('HERE');
  res.status(400).send({ error: 'Something went wrong' });
};

const changePaymentMethod = async (req, res, next) => {
  let user = req.user;
  const subscription = req.subscription;
  const body = req.body;
  try {
    const source = await stripe.customers.listSources(subscription.customer);
    const cardId = source.data[0].id;
    await stripe.customers.deleteSource(subscription.customer, cardId);
  } catch (e) {
    console.log('No card was before');
  }
  try {
    const source = await stripe.customers.createSource(subscription.customer, {
      source: body.stripe_token,
    });
    await Subscription.update({ last4: source.last4 }, { where: { id: subscription.id } });
  } catch (e) {
    console.log(e);
    res.status(400).send({ error: 'Something went wrong' });
    return;
  }
  user = await userToFront(user.id);
  res.send({ user });
};

const remindAboutSubscriptionEnd = async (req, res, next) => {
  const user = req.user;
  await User.update(
    {
      remind_about_sub_end: true,
    },
    {
      where: {
        id: user.id,
      },
    }
  );
  res.status(200).send({ message: 'You will be reminded' });
};

module.exports = {
  pauseSubscription,
  resetSubscription,
  changePaymentMethod,
  remindAboutSubscriptionEnd,
};
