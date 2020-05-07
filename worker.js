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
cron.schedule(CRON_INTERVALS.EVERY5MINUTES, dailyText);
// check users with startDay
cron.schedule(CRON_INTERVALS.EVERY1HOUR, checkUserStartDay);

// other messages
cron.schedule(CRON_INTERVALS.EVERY5MINUTES, sendFirstDailySms);

// send undelivered messages
cron.schedule(CRON_INTERVALS.EVERY1HOUR, sendUndeliveredDailyMessages);

cron.schedule(CRON_INTERVALS.EVERY5MINUTES, subscriptionNotifications);

cron.schedule(CRON_INTERVALS.EVERY5MINUTES, sendMessageAfterFirstDailyMessage);

cron.schedule(CRON_INTERVALS.EVERY5MINUTES, sendAdditionalSms);

cron.schedule(CRON_INTERVALS.EVERY5MINUTES, sendDiscountSms);

cron.schedule(CRON_INTERVALS.EVERY5MINUTES, sendRemindMessages);
