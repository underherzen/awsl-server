const {Session, User, UserGuide, UserGuideDay, Subscription} = require('../models');

const retrieveToken = async headers => {
  let token = headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return null
  }
  token = token.split(' ').pop();
  const record = await Session.findByPk(token);
  if (!record) {
    return null
  }
  return record;
};

const userToFront = async id => {
  let user, userGuides, userGuideDays, subscription;
  [user, userGuides, userGuideDays, subscription] = await Promise.all([
    User.findByPk(id, {raw: true}),
    UserGuide.findAll(
      {where: {user_id: id}}
    ),
    UserGuideDay.findAll({where: {user_id: id}}),
    Subscription.findOne({where: {user_id: id}})
  ]);
  user.all_guides = userGuides;
  user.all_guide_days = userGuideDays;
  user.subscription_status = subscription.status;
  user.next_payment = subscription.next_payment;
  user.last4 = subscription.last4;
  user.cancel_at_period_end = subscription.cancel_at_period_end;
  return user
};

const generateRandString = () => {
  return Math.random().toString(36).substring(2, 25) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
};

module.exports = {
  retrieveToken,
  userToFront,
  generateRandString
};
