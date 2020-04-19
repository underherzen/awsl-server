const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const {User, Subscription} = require('../../../../models');
const {STRIPE_STATUSES} = require('../../../../constants');
const {userToFront} = require('../../../../modules/helpers');

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
  const subscription = await Subscription.findOne({where: {user_id: user.id}});

  if (!subscription) {
    res.sendStatus(400);
    return;
  }

  await stripe.subscriptions.update(subscription.id, {
    cancel_at_period_end: true,
  });
  // and then change db record for returning to user
  await Subscription.update(
    {status: STRIPE_STATUSES.PAUSED},
    {where: {id: subscription.id}}
  );

  user = await userToFront(user.id);
  res.send({user});
};

module.exports = {
  pauseSubscription
};
