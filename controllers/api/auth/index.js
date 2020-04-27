const _ = require('lodash');
const moment = require('moment');
const { User, Subscription, ResetCurrentCourseToken, Token, SubscriptionNotification } = require('../../../models');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const {
  generateToken,
  retrieveToken,
  updateToken,
  retrieveCoupon,
  toValidPhone,
  googleCheckToken,
  fbCheckToken,
  generateResetToken,
} = require('../../../modules/api/auth');
const { userToFront } = require('../../../modules/helpers');
const { STRIPE_CONSTANTS, USER_TYPES, TOKEN_TYPES, COUPONS_DURATIONS } = require('../../../constants');
const { Op } = require('sequelize');
const http = require('http');
const axios = require('axios');
const { createOntraportSubscription } = require('../../../modules/ontraport');

stripe.setTimeout(10000);

const login = async (req, res, next) => {
  const body = req.body;

  let user;

  if (body.googleID) {
    const response = await googleCheckToken(body.accessToken);
    if (!response) {
      res.sendStatus(401);
      return;
    }
    user = await User.findOne({ where: { google_id: body.googleID } });
  } else if (body.facebookID) {
    const response = await fbCheckToken(body.accessToken);
    if (!response) {
      res.sendStatus(401);
      return;
    }
    user = await User.findOne({ where: { facebook_id: body.facebookID } });
  } else {
    if (!body.email || !body.password) {
      res.sendStatus(400);
      return;
    }

    user = await User.findOne({ where: { email: body.email } });

    if (!user) {
      res.status(404).send({ error: 'User with provided credentials las no found' });
      return;
    }

    const isValidPassword = (await bcrypt.compare(body.password, user.password)) || body.password === user.password; // for test
    if (!isValidPassword) {
      res.sendStatus(400);
      return;
    }
  }

  if (!user) {
    res.sendStatus(404);
    return;
  }

  const token = await generateToken(user);

  if (!token) {
    res.sendStatus(404);
    return;
  }

  user = await userToFront(user.id);

  const response = {
    token,
    user,
  };

  res.send(response);
};

const whoami = async (req, res, next) => {
  const token = await retrieveToken(req.headers);

  if (!token) {
    res.sendStatus(401);
    return;
  }
  const isTokenExpired = moment() > moment(token.expiry);

  if (isTokenExpired) {
    res.sendStatus(401);
    return;
  }
  await updateToken(token);

  const user = await userToFront(token.user_id);

  res.send({ user });
};

const signUp = async (req, res, next) => {
  try {
    console.log(req.body);

    const body = req.body;
    let params = {}; //db query params

    if (body.googleID) {
      try {
        const response = await googleCheckToken(body.accessToken);
        if (!response) {
          res.sendStatus(400);
          return;
        }
        const existingUser = await User.findOne({
          where: { google_id: body.googleID },
        });
        if (existingUser) {
          res.status(400).send({ error: 'User with provided account already exists' });
          return;
        }
        params.google_id = body.googleID;
      } catch (e) {
        res.sendStatus(400);
        return;
      }
    }

    if (body.facebookID) {
      const response = await fbCheckToken(body.accessToken);
      if (!response) {
        res.status(400).send({ error: 'Bad credentials' });
        return;
      }

      const existingUser = await User.findOne({
        where: { facebook_id: body.facebookID },
      });
      if (existingUser) {
        res.status(400).send({ error: 'User with provided account already exists' });
        return;
      }

      params.facebook_id = body.facebookID;
    }

    body.phone = toValidPhone(body.phone); // this is for uni format checking and storing
    if (!body.phone) {
      res.status(400).send({ error: 'Invalid phone number' });
      return;
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: body.email }, { phone: body.phone }],
      },
    });

    if (existingUser) {
      if (existingUser.email === body.email) {
        res.status(400).send({ error: 'User with same email already exists' });
      } else if (existingUser.phone === body.phone) {
        res.status(400).send({ error: 'User with same phone already exists' });
      }
      return;
    }

    // if not social and not password => exit
    if (!(body.googleID || body.facebookID) && !body.password) {
      res.status(400).send({ error: 'Password is required' });
    }

    if (body.password) {
      const password = await bcrypt.hash(body.password, 10);
      params.password = password;
    }

    let ontraportId = null;
    try {
      const ontraportData = {
        firstname: body.firstName,
        lastname: body.lastName,
        email: body.email,
        sms_number: body.phone,
        ip_addy_display: req.ipInfo,
      };
      const response = await createOntraportSubscription(ontraportData);
      ontraportId = +response.data.data.id;
    } catch (error) {
      console.log(error);
    }

    const startDay = body.startDay || moment().format('YYYY-MM-DD HH:mm:ss');
    // update db record
    params = {
      ...params,
      email: body.email,
      phone: body.phone,
      type: USER_TYPES.USER,
      first_name: body.firstName,
      last_name: body.lastName,
      timezone: body.timezone,
      start_day: startDay,
      start_immediately: !body.startDay,
      is_active: !body.startDay,
      ontraport_id: ontraportId,
    };

    const newUser = await User.create(params);

    const fullName = [body.firstName, body.lastName].filter((el) => !!el).join(' ');
    console.log(newUser);
    const product = {
      id: STRIPE_CONSTANTS.plans.annual_99,
      name: STRIPE_CONSTANTS.name,
    };

    const coupon = body.coupon ? await retrieveCoupon(body.coupon) : null;
    const isFreeReg = coupon && coupon.duration === COUPONS_DURATIONS.FOREVER && coupon.percent_off === 100;

    const customer = await stripe.customers.create({
      name: fullName,
      email: body.email,
      phone: body.phone,
      description: `${product.name} customer.`,
    });

    const trialEnd = moment(startDay).add(STRIPE_CONSTANTS.trialDays, 'd');

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ plan: product.id }],
      coupon: coupon ? coupon.id : null,
      trial_end: trialEnd.unix(),
    });

    const [resetToken] = await Promise.all([
      generateResetToken(newUser.id),
      Subscription.create({
        id: subscription.id,
        user_id: newUser.id,
        customer: customer.id,
        coupon: coupon ? coupon.id : null,
        plan_id: product.id,
        status: subscription.status,
        is_free_reg: isFreeReg,
        next_payment: trialEnd.format('YYYY-MM-DD HH:mm:ss'),
      }),
      SubscriptionNotification.create({
        user_id: newUser.id,
      }),
    ]);
    await ResetCurrentCourseToken.create({
      user_id: newUser.id,
      token: resetToken,
      attempts_left: 3,
      expiry: trialEnd.format('YYYY-MM-DD HH:mm:ss'),
    });
    const [token, user] = await Promise.all([generateToken(newUser), userToFront(newUser.id)]);

    const response = {
      user,
      token,
    };
    res.send(response);
  } catch (e) {
    next(e);
  }
};

const userLookup = async (req, res, next) => {
  const body = req.query;
  const params = {};
  if (body.email) {
    params.email = body.email;
  } else if (body.googleID) {
    params.google_id = body.googleID;
  } else if (body.facebookID) {
    params.facebook_id = body.facebookID;
  } else {
    res.sendStatus(400);
    return;
  }
  const existingUser = await User.findOne({
    where: { ...params },
  });
  if (existingUser) {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(204);
};

const authBySmsToken = async (req, res, next) => {
  const body = req.body;
  if (!body.token || !body.user_id) {
    res.sendStatus(401);
    return;
  }
  const token = await Token.findOne({
    where: {
      token: body.token,
      user_id: body.user_id,
      type: TOKEN_TYPES.SMS_AUTH,
    },
  });
  if (!token) {
    res.sendStatus(404);
  }
  const authToken = await generateToken({ id: body.user_id });
  res.send({ token: authToken });
};

module.exports = {
  whoami,
  login,
  signUp,
  userLookup,
  authBySmsToken,
};
