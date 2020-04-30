const {
  Session,
  User,
  UserGuide,
  UserGuideDay,
  Subscription,
  ResetCurrentCourseToken,
  Token,
  SubscriptionNotification,
} = require('../models');
const { TOKEN_TYPES } = require('../constants');
const axios = require('axios');
const _ = require('lodash');

const retrieveToken = async (headers) => {
  let token = headers.authorization;
  if (!token || !token.startsWith('Bearer ')) {
    return null;
  }
  token = token.split(' ').pop();
  const record = await Session.findByPk(token);
  if (!record) {
    return null;
  }
  return record;
};

const guidesToObjForFront = (userGuides, userGuideDays) => {
  const userGuideCopy = _.cloneDeep(userGuides);
  const guideObj = {};
  for (let guide of userGuideCopy) {
    guideObj[+guide.guide_id] = guide.dataValues;
    guideObj[+guide.guide_id].accepted_days = [];
    guideObj[+guide.guide_id].visited_days = [];
  }

  for (let day of userGuideDays) {
    if (day.accepted) {
      guideObj[+day.guide_id].accepted_days.push(day.day);
    }
    if (day.visited) {
      guideObj[+day.guide_id].visited_days.push(day.day);
    }
  }
  return guideObj;
};

const userToFront = async (id) => {
  let user, userGuides, userGuideDays, subscription, resetCurrentCourseToken, subscriptionNotification;
  [
    user,
    userGuides,
    userGuideDays,
    subscription,
    resetCurrentCourseToken,
    subscriptionNotification,
  ] = await Promise.all([
    User.findByPk(id, { raw: true }),
    UserGuide.findAll({ where: { user_id: id } }),
    UserGuideDay.findAll({ where: { user_id: id } }),
    Subscription.findOne({ where: { user_id: id } }),
    ResetCurrentCourseToken.findOne({ where: { user_id: id } }),
    SubscriptionNotification.findOne({ where: { user_id: id } }),
  ]);
  // console.log(userGuides)
  // console.log(userGuideDays);
  user.guides = guidesToObjForFront(userGuides, userGuideDays);
  user.all_guides = userGuides;
  user.all_guide_days = userGuideDays;
  user.subscription_status = subscription.status;
  user.next_payment = subscription.next_payment;
  user.last4 = subscription.last4;
  user.cancel_at_period_end = subscription.cancel_at_period_end;
  user.reset_current_course_token = resetCurrentCourseToken.token;
  user.reset_current_course_attempts = resetCurrentCourseToken.attempts_left;
  user.subscription_notifications = subscriptionNotification;
  delete user.password;
  delete user.created_at;
  delete user.updated_at;
  delete user.can_receive_texts;
  return user;
};

const generateRandString = () => {
  return (
    Math.random().toString(36).substring(2, 25) +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

const imageExists = async (url) => {
  try {
    const response = await axios.get(url);
    const contentType = response.headers['content-type'];
    return contentType.indexOf('image') > -1;
  } catch (e) {
    return false;
  }
};

const generateSmsAuthToken = async (userId) => {
  try {
    let token = generateRandString();
    let doNext = true;
    let count = 0;
    while (doNext && count < 10) {
      const existingToken = await Token.findOne({
        where: {
          token,
          type: TOKEN_TYPES.SMS_AUTH,
          // user_id: userId,
        },
      });
      if (!existingToken) {
        await Token.create({
          user_id: userId,
          token,
          type: TOKEN_TYPES.SMS_AUTH,
        });
        doNext = false;
        return token;
      }
      token = generateRandString();
      count += 1;
    }
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

const parseUrlEncode = (str) => {
  const body = {};
  const urlencodedPlus = '%2B';
  str.split('&').forEach((arg) => {
    const splits = arg.split('=');
    body[splits[0]] = splits[1].replace(urlencodedPlus, '+');
  });
  return body;
};

module.exports = {
  retrieveToken,
  userToFront,
  generateRandString,
  imageExists,
  generateSmsAuthToken,
  parseUrlEncode,
};
