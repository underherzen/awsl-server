const _ = require('lodash');
const moment = require('moment');
const {Subscription, User} = require('../../../models');
const {ACTIVE_STATUSES, INACTIVE_STATUSES} = require('./../../../constants');

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

  const couponId = _.get(subscriptionObj, 'discount.coupon.id', null);

  await Subscription.update(
    {
      status: subscriptionObj.status,
      next_payment: moment(subscriptionObj.current_period_end * 1000).format('YYYY-MM-DD HH:mm:ss'),
      plan_id: subscriptionObj.plan.id,
      coupon: couponId
    },
    {where: {id: subscription.id}}
  );

  if (ACTIVE_STATUSES.includes(subscriptionObj.status)) {
    await User.update({is_active: true}, {where: {id: subscription.user_id}})
  } else {
    await User.update({is_active: false}, {where: {id: subscription.user_id}})
  }

  res.sendStatus(200);
};

const customerUpdateWebhook = async (req, res, next) => {
  const body = req.body;
  const customerObj = body.data.object;
  const {email, name, phone, sources} = customerObj;
  const subscription = await Subscription.findOne({where: {customer: customerObj.id}});

  if (!subscription) {
    res.sendStatus(404);
    return
  }

  const promises = [
    User.update(
      {
        first_name: name.split(' ')[0],
        last_name: name.split(' ')[1] || null,
        email,
        phone
      },
      {
        where: {
          id: subscription.user_id
        }
      }
    )
  ];
  const last4 = _.get(sources, 'data[0].last4', null);
  promises.push(
    Subscription.update(
      {last4},
      {where: {id: subscription.id}}
    )
  );
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
  customerUpdateWebhook
};
