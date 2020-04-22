require('dotenv').config();
const cron = require('node-cron');

const {dailyText, sendFirstDailySms, sendUndeliveredDailyMessages} = require('./crons/messages');
const {checkUserStartDay} = require('./crons/users');
const {CRON_INTERVALS} = require('./constants');


//schedule tasks

// daily 6am updates and sms
// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, dailyText);
// check users with startDay
// cron.schedule(CRON_INTERVALS.EVERYMINUTE, checkUserStartDay);

// other messages
// cron.schedule(CRON_INTERVALS.EVERY10SECONDS, sendFirstDailySms)

// send undelivered messages
cron.schedule(CRON_INTERVALS.EVERY10SECONDS, sendUndeliveredDailyMessages);


