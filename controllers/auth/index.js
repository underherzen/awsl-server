const express = require('express');
const router = express.Router();
const _ = require('lodash');
const moment = require('moment');
const {User, Subscription} = require('../../models');
const bcrypt = require('bcryptjs');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const {generateToken, retrieveToken, updateToken, retrieveCoupon, toValidPhone, googleCheckToken, fbCheckToken} = require('../../modules/auth');
const {STRIPE_CONSTANTS, USER_TYPES} = require('../../constants');
const {Op} = require('sequelize');
const http = require('http');
const axios = require('axios');

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
    user = await User.findOne({where: {google_id: body.googleID}});
  } else if (body.facebookID) {
    const response = await fbCheckToken(body.accessToken);
    if (!response) {
      res.sendStatus(401);
      return;
    }
    user = await User.findOne({where: {facebook_id: body.facebookID}})
  } else {
    if (!body.email || !body.password) {
      res.sendStatus(400);
      return;
    }

    user = await User.findOne({where: {email: body.email}});
    const isValidPassword = (await bcrypt.compare(body.password, user.password)) || body.password === user.password; // for test
    if (!isValidPassword) {
      res.sendStatus(400);
      return
    }
  }

  if (!user) {
    res.sendStatus(404);
    return
  }

  const token = await generateToken(user);

  if (!token) {
    res.sendStatus(404);
    return;
  }

  const response = {
    token,
    user
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

  const user = await User.findByPk(token.user_id);
  res.send({user});
};

const signUp = async (req, res, next) => {
  console.log(req.body);

  const body = req.body;
  let params = {}; //db query params

  if (body.googleID) {
    try {
      const response = await googleCheckToken(body.accessToken);
      if (!response) {
        res.sendStatus(400);
        return
      }
      const existingUser = await User.findOne({where: {google_id: body.googleID}});
      if (existingUser) {
        res.status(400).send({error: 'User with provided account already exists'});
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
      res.status(400).send({error: 'Bad credentials'});
      return;
    }

    const existingUser = await User.findOne({where: {facebook_id: body.facebookID}});
    if (existingUser) {
      res.status(400).send({error: 'User with provided account already exists'});
      return;
    }

    params.facebook_id = body.facebookID;
  }

  body.phone = toValidPhone(body.phone); // this is for uni format checking and storing
  if (!body.phone) {
    res.status(400).send({error: 'Invalid phone number'});
    return;
  }

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [
        {email: body.email},
        {phone: body.phone}
      ]
    }
  });

  if (existingUser) {
    if (existingUser.email === body.email) {
      res.status(400).send({error: 'User with same email already exists'})
    } else if (existingUser.phone === body.phone) {
      res.status(400).send({error: 'User with same phone already exists'})
    }
    return;
  }

  // if not social and not password => exit
  if (!(body.googleID || body.facebookID) && !body.password) {
    res.status(400).send({error: 'Password is required'})
  }

  if (body.password) {
    const password = await bcrypt.hash(body.password, 10);
    params.password = password
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
    start_immediately: !body.startDay
  };

  const newUser = await User.create(params);

  const fullName = [body.firstName, body.lastName].filter(el => !!el).join(' ');
  console.log(newUser);
  const product = {
    id: STRIPE_CONSTANTS.plans.annual_99, // NOTE: This is the ID for the plan, NOT the product, in stripe's API thingamajig (https://dashboard.stripe.com/plans/annual)
    name: STRIPE_CONSTANTS.name,
  };

  const coupon = body.coupon ? await retrieveCoupon(body.coupon) : null;

  const customer = await stripe.customers.create({
    name: fullName,
    email: body.email,
    phone: body.phone,
    description: `${product.name} customer.`
  });

  const trialEnd = moment().add(STRIPE_CONSTANTS.trialDays, 'd');

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{plan: product.id}],
    coupon,
    trial_end: trialEnd.unix(),
  });

  await Subscription.create({
    id: subscription.id,
    user_id: newUser.id,
    customer: customer.id,
    coupon,
    next_payment: trialEnd.format('YYYY-MM-DD'),
    is_trial: true
  });

  const token = await generateToken(newUser);

  const response = {
    user: newUser,
    token
  };

  res.send(response);
};

const userLookup = async (req, res, next) => {
  const body = req.query;
  console.log(body);
  const params = {};
  if (body.email) {
    params.email = body.email
  } else if (body.googleID) {
    params.google_id = body.googleID
  } else if (body.facebookID) {
    params.facebook_id = body.facebookID
  } else {
    res.sendStatus(400);
    return;
  }
  const existingUser = await User.findOne({
    where: {...params}
  });
  if (existingUser) {
    res.sendStatus(400);
    return;
  }
  res.sendStatus(204)
};

module.exports = {
  whoami,
  login,
  signUp,
  userLookup
};
