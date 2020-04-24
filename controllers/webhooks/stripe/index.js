const _ = require('lodash');
const moment = require('moment');
const { Subscription, User, ResetCurrentCourseToken, SubscriptionNotification } = require('../../../models');
const { ACTIVE_STATUSES, INACTIVE_STATUSES, COUPONS_DURATIONS } = require('./../../../constants');

const subscriptionUpdateWebhook = async (req, res, next) => {
  const body = req.body;
  console.log(body);
  const subscriptionObj = _.get(body, 'data.object', null);

  if (!subscriptionObj) {
    res.sendStatus(404);
    return;
  }

  const subscription = await Subscription.findByPk(subscriptionObj.id);
  if (!subscription) {
    res.sendStatus(404);
    return;
  }

  const coupon = _.get(subscriptionObj, 'discount.coupon', null);
  let isFreeReg = false;
  if (coupon && coupon.duration === COUPONS_DURATIONS.FOREVER && coupon.percent_off === 100) {
    isFreeReg = true;
  }
  const couponId = coupon ? coupon.id : null;

  // this is when subscription period is changed

  const promises = [
    Subscription.update(
      {
        status: subscriptionObj.status,
        next_payment: moment(subscriptionObj.current_period_end * 1000).format('YYYY-MM-DD HH:mm:ss'),
        plan_id: subscriptionObj.plan.id,
        coupon: couponId,
        cancel_at_period_end: subscriptionObj.cancel_at_period_end,
        is_free_reg: isFreeReg,
      },
      { where: { id: subscription.id } }
    ),
  ];

  const diff = moment(subscriptionObj.current_period_end * 1000).diff(moment(subscription.next_payment), 'h');
  if (diff > 5) {
    promises.push(
      ResetCurrentCourseToken.update(
        {
          attempts_left: 3,
          expiry: moment(subscriptionObj.current_period_end * 1000).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
          where: { user_id: subscription.user_id },
        }
      )
    );
  }

  if (isFreeReg) {
    promises.push(
      SubscriptionNotification.update(
        {
          discount_modal: false,
          end_of_subscription: false,
          last_trial_day: false,
        },
        { where: { user_id: subscription.user_id } }
      )
    );
  }

  await Promise.all(promises);

  if (ACTIVE_STATUSES.includes(subscriptionObj.status)) {
    await User.update({ is_active: true }, { where: { id: subscription.user_id } });
  } else {
    await User.update({ is_active: false }, { where: { id: subscription.user_id } });
  }

  res.sendStatus(200);
};

const customerUpdateWebhook = async (req, res, next) => {
  const body = req.body;
  const customerObj = body.data.object;
  const { email, name, phone, sources } = customerObj;
  const subscription = await Subscription.findOne({
    where: { customer: customerObj.id },
  });

  if (!subscription) {
    res.sendStatus(404);
    return;
  }

  const promises = [
    User.update(
      {
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1] || null,
        email,
        phone,
      },
      {
        where: {
          id: subscription.user_id,
        },
      }
    ),
  ];
  const last4 = _.get(sources, 'data[0].last4', null);
  promises.push(Subscription.update({ last4 }, { where: { id: subscription.id } }));
  try {
    await Promise.all(promises);
  } catch (e) {
    console.log('DB ERROR:');
    console.log(e);
  }

  res.sendStatus(200);
};

module.exports = {
  subscriptionUpdateWebhook,
  customerUpdateWebhook,
};
