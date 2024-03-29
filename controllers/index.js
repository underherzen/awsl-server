const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const { User, Subscription } = require('../models');
const { retrieveToken } = require('../modules/helpers');
const { USER_TYPES } = require('../constants');
const moment = require('moment');

const isUserActive = (req, res, next) => {
  try {
    if (!req.user.is_active) {
      res.sendStatus(401);
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
};

const userIsAuth = async (req, res, next) => {
  try {
    const token = await retrieveToken(req.headers);
    if (!token) {
      res.sendStatus(401);
      return;
    }

    if (moment() > moment(token.expiry)) {
      res.sendStatus(401);
      return;
    }

    const user = await User.findByPk(token.user_id);
    if (!user) {
      res.sendStatus(401);
      return;
    }
    req.user = user.dataValues;
    next();
  } catch (e) {
    next(e);
  }
};

const userIsAdmin = async (req, res, next) => {
  try {
    if (req.user.type === USER_TYPES.ADMIN) {
      next();
      return;
    }
    res.sendStatus(401);
  } catch (e) {
    next(e);
  }
};

const userHasSubscription = async (req, res, next) => {
  try {
    let user = req.user;
    const subscription = await Subscription.findOne({
      where: { user_id: user.id },
    });

    if (!subscription) {
      res.sendStatus(400);
      return;
    }
    req.subscription = subscription;
    next();
  } catch (e) {
    next(e);
  }
};

/**
 * This middleware is for endpoints that are for subscription ONLY
 * Use this middleware only after `userHasSubscription` middleware
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
const retrieveAndUpdateUserSubscription = async (req, res, next) => {
  try {
    let subscription = req.subscription;
    const subscriptionInStripe = await stripe.subscriptions.retrieve(subscription.id);
    await Subscription.update(
      {
        status: subscriptionInStripe.status,
        next_payment: moment(subscriptionInStripe.current_period_end * 1000).format('YYYY-MM-DD HH:mm:ss'),
        plan_id: subscriptionInStripe.plan.id,
        cancel_at_period_end: subscriptionInStripe.cancel_at_period_end,
      },
      { where: { id: subscription.id } }
    );
    subscription = await Subscription.findByPk(subscription.id);
    req.subscription = subscription;
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  isUserActive,
  userIsAuth,
  userIsAdmin,
  userHasSubscription,
  retrieveAndUpdateUserSubscription,
};
