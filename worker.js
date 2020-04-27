require('dotenv').config();
const cron = require('node-cron');

const {
  dailyText,
  sendFirstDailySms,
  sendUndeliveredDailyMessages,
  sendRemindMessages,
  sendDiscountSms,
  sendMessageAfterFirstDailyMessage,
  sendAdditionalSms,
} = require('./crons/messages');
const { checkUserStartDay, subscriptionNotifications } = require('./crons/users');
const { CRON_INTERVALS } = require('./constants');

//schedule tasks

// daily 6am updates and sms
// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, dailyText);
// check users with startDay
// cron.schedule(CRON_INTERVALS.EVERYMINUTE, checkUserStartDay);

// other messages
cron.schedule(CRON_INTERVALS.EVERYMINUTE, sendFirstDailySms);

// send undelivered messages
// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, sendUndeliveredDailyMessages);

//cron.schedule(CRON_INTERVALS.EVERY4SECONDS, subscriptionNotifications);

// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, sendMessageAfterFirstDailyMessage);

// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, sendAdditionalSms);

// cron.schedule(CRON_INTERVALS.EVERY4SECONDS, sendDiscountSms);
