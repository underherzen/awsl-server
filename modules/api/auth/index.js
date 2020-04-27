const bcrypt = require('bcryptjs');
const moment = require('moment');
const _ = require('lodash');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const { User, Session, ResetCurrentCourseToken } = require('../../../models');
const libphonenumber = require('libphonenumber-js');
const axios = require('axios');
const { generateRandString } = require('../../helpers');

const generateToken = async ({ id }) => {
  const expiry = moment().add(1, 'd').format('YYYY-MM-DD HH:mm:ss');
  let doNext = true;
  while (doNext) {
    const token = generateRandString();
    console.log(token);
    try {
      await Session.create({
        id: token,
        user_id: id,
        token,
        expiry,
      });
      doNext = false;
      return token;
    } catch (e) {
      console.log(e);
    }
  }
};

const retrieveToken = async (headers) => {
  let token = headers.authorization;
  if (!token.startsWith('Bearer ')) {
    return null;
  }
  token = token.split(' ').pop();
  const record = await Session.findByPk(token);
  if (!record) {
    return null;
  }
  return record;
};

const updateToken = async (token = {}) => {
  const newExpiry = moment(token.expiry).add(10, 'm').format('YYYY-MM-DD HH:mm:ss');
  await Session.update({ expiry: newExpiry }, { where: { id: token.id } });
  return true;
};

const retrieveCoupon = async (coupon) => {
  try {
    coupon = coupon.trim().toUpperCase();
    coupon = await stripe.coupons.retrieve(coupon);
    return coupon;
  } catch (e) {
    return null;
  }
};

const toValidPhone = (phone, countryCode = 'US') => {
  let userPhone = libphonenumber.parsePhoneNumberFromString(phone);
  if (userPhone && userPhone.isValid()) {
    return userPhone.number;
  }
  userPhone = libphonenumber.parsePhoneNumberFromString(phone, countryCode);
  if (userPhone && userPhone.isValid()) {
    return userPhone.number;
  }
  return null;
};

const googleCheckToken = async (token) => {
  try {
    const url = `https://www.googleapis.com/oauth2/v2/tokeninfo?id_token=${token}`;
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    if (!response.data) {
      return null;
    }
    return response;
  } catch (e) {
    return null;
  }
};

const fbCheckToken = async (token) => {
  try {
    const url = `https://graph.facebook.com/debug_token?input_token=${token}&access_token=${process.env.FB_SECRET}`;
    const response = await axios.get(url);
    if (!response.data || !response.data.is_valid || !response.data.user_id) {
      return null;
    }
    return response;
  } catch (e) {
    console.log(e);
    return null;
  }
};

/**
 * doesnt update db but generates token that doest exist in db
 * @param userId
 * @returns {Promise<void>}
 */
const generateResetToken = async (userId) => {
  let doNext = true;
  let count = 0;
  while (doNext && count < 10) {
    const token = generateRandString();
    const existingToken = await ResetCurrentCourseToken.findOne({
      where: { token },
    });
    if (!existingToken) {
      doNext = false;
      return token;
    }
    count += 1;
  }
  return null;
};

module.exports = {
  generateToken,
  retrieveToken,
  updateToken,
  retrieveCoupon,
  toValidPhone,
  googleCheckToken,
  fbCheckToken,
  generateResetToken,
};
