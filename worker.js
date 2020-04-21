require('dotenv').config();
const cron = require('node-cron');

const {dailyText} = require('./crons/messages');
const {CRON_INTERVALS} = require('./constants');


//schedule tasks

// daily 6am updates and sms
cron.schedule(CRON_INTERVALS.EVERY10SECONDS, dailyText);
// check if active is
