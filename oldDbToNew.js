require('dotenv').config();
const mysql = require('mysql2');
const moment = require('moment');
const _ = require('lodash');
const {
  User,
  UserGuide,
  UserGuideDay,
  Subscription,
  ShortUrl,
  Token,
  Guide,
  ResetCurrentCourseToken,
  Message,
  SubscriptionNotification,
} = require('./models');
const { USER_TYPES, MESSAGES_TYPES, STRIPE_STATUSES, TOKEN_TYPES, MESSAGES_STATUSES } = require('./constants');
const { generateRandString } = require('./modules/helpers');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);

const timeout = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, 100);
  });

const processTimezone = (tz) => {
  let timezone;
  let parts = tz.split(':');
  const hours = eval(parts[0]) * -60;
  const minutes = eval(parts[1]) * +(tz[0] === '+' ? -1 : 1);
  const result = minutes + hours;
  return result;
  // console.log(eval(parts[0]))
};

async function main() {
  const con = await mysql.createConnection({
    host: process.env.OLD_DB_HOST,
    user: process.env.OLD_DB_USERNAME,
    password: process.env.OLD_DB_PASSWORD,
    database: process.env.OLD_DB_NAME,
  });

  const [
    [users],
    [subscriptions],
    [shortUrls],
    [resetTokens],
    [messages],
    [userTokens],
    [userGuides],
  ] = await Promise.all([
    con.promise().query('SELECT * FROM users'),
    con.promise().query('SELECT * FROM subscriptions'),
    con.promise().query('SELECT * FROM shortUrls'),
    con.promise().query('SELECT * FROM resetTokens'),
    con.promise().query('SELECT * FROM messages'),
    con.promise().query('SELECT * FROM userTokens'),
    con.promise().query('SELECT * FROM userGuides'),
  ]);
  // console.log(allSubscriptions.data)
  const newUsers = [];
  for (let user of users) {
    console.log(user);
    try {
      let userGuideId = null;
      if (user.guideId) {
        const guide = await Guide.findOne({
          where: {
            old_guide_id: user.guideId,
          },
        });
        userGuideId = guide ? guide.id : null;
      }

      /*
      USER CREATING
       */
      const newUser = await User.create({
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        password: user.password,
        phone: user.phone,
        timezone: processTimezone(user.timezone),
        guide_id: userGuideId,
        can_receive_texts: user.canReceiveTexts,
        start_day: user.startDay || moment().format('YYYY-MM-DD HH:mm:ss'),
        start_immediately: user.startImmediately || false,
        google_id: user.googleID,
        facebook_id: user.facebookID,
        remind_about_sub_end: user.remindThirtyDaysBefore,
        type: USER_TYPES.USER,
      });

      /*
      SUBSCRIPTION CREATING
       */
      const dbSubscription = subscriptions.find((sub) => sub.userId === user.id);
      const stripeSub = await stripe.subscriptions.retrieve(dbSubscription.id);
      const stripeCustomer = await stripe.customers.retrieve(stripeSub.customer);
      const coupon = _.get(stripeSub, 'discount.coupon', null);
      let isFreeReg = false;
      if (coupon && coupon.duration === 'forever' && coupon.percent_off === 100) {
        isFreeReg = true;
      }
      const last4 = _.get(stripeCustomer, 'sources.data[0].last4', null);
      const newSubscription = await Subscription.create({
        id: stripeSub.id,
        user_id: newUser.id,
        customer: stripeCustomer.id,
        status: stripeSub.status,
        plan_id: stripeSub.plan.id,
        coupon: _.get(stripeSub, 'discount.coupon.id'),
        is_free_reg: isFreeReg,
        cancel_at_period_end: stripeSub.cancel_at_period_end,
        next_payment: moment(stripeSub.current_period_end * 1000).format('YYYY-MM-DD HH:mm:ss'),
        last4,
      });
      const resetToken = resetTokens.find((token) => token.userId === user.id);

      /*
      RESET CURRENT COURSE TOKENS CREATING
       */
      console.log('RUNNING RESET COURSE');
      await ResetCurrentCourseToken.create({
        user_id: newUser.id,
        token: resetToken ? resetToken.resetCurrentCourseToken : generateRandString(),
        expiry: newSubscription.next_payment,
        attempts_left: resetToken ? 3 - resetToken.resetCourseRetries : 3,
      });
      /*
      USER GUIDES CREATING
       */
      const userGuidesPromises = [];
      const userSGuides = userGuides.filter((guide) => guide.userId === user.id);
      for (let userGuide of userSGuides) {
        const procGuide = await Guide.findOne({
          where: {
            old_guide_id: userGuide.guideId,
          },
        });
        if (userGuide.isComplete) {
          let count = 0;
          userGuidesPromises.push(
            UserGuide.create({
              user_id: newUser.id,
              day: 21,
              guide_id: procGuide.id,
              completed: true,
            })
          );
          while (count < 22) {
            userGuidesPromises.push(
              UserGuideDay.create({
                user_id: newUser.id,
                guide_id: procGuide.id,
                day: count,
                accepted: true,
                visited: true,
              })
            );
            count += 1;
          }
        } else {
          if (user.day) {
            let count = 0;
            userGuidesPromises.push(
              UserGuide.create({
                guide_id: procGuide.id,
                day: user.day,
                completed: false,
                user_id: newUser.id,
              })
            );
            while (count < +user.day + 1) {
              userGuidesPromises.push(
                UserGuideDay.create({
                  user_id: newUser.id,
                  guide_id: procGuide.id,
                  day: count,
                })
              );
              count += 1;
            }
          }
        }
      }
      await Promise.all(userGuidesPromises);

      /*
      SHORT URLS
       */

      const usersShortUrls = shortUrls.filter((url) => url.userId === user.id);
      await Promise.all(
        usersShortUrls.map((url) => {
          return ShortUrl.create({
            user_id: newUser.id,
            short_url: url.shortUrl,
            full_url: url.fullUrl,
          });
        })
      );

      /*
      TOKENS CREATING
       */

      const usersTokens = userTokens.filter((token) => token.userId === user.id);
      await Promise.all(
        usersTokens.map((token) => {
          console.log('TOKEN', token);
          return Token.create({
            user_id: newUser.id,
            token: token.token,
            type: TOKEN_TYPES.SMS_AUTH,
          });
        })
      );
      /*
      SUB NOTIFICATIONS
       */
      await SubscriptionNotification.create({
        user_id: newUser.id,
      });

      /*
      CREATING MESSAGES TO NOT TO FUCK IT UP ;)
       */
      try {
        const messagesPromises = [];
        const usersMessages = messages.find((m) => m.userId === user.id);
        if (usersMessages.firstDaySmsSent) {
          messagesPromises.push(
            Message.create({
              user_id: newUser.id,
              type: MESSAGES_TYPES.DAILY,
              status: MESSAGES_STATUSES.DELIVERED,
              created_at: usersMessages.firstDaySmsSentAt,
            })
          );
        }
        if (usersMessages.followingUpMessageSent) {
          messagesPromises.push(
            Message.create({
              user_id: newUser.id,
              type: MESSAGES_TYPES.AFTER_FIRST_DAILY_MESSAGE,
              status: MESSAGES_STATUSES.DELIVERED,
            })
          );
        }

        await Promise.all(messagesPromises);
      } catch (e) {
        console.log(e);
      }

      console.log('messagesPromises');
      // console.log(messagesPromises);
    } catch (e) {
      console.log(e);
    }

    await timeout();
  }
  con.end();
}

// processTimezone('+03:30');

main();
