require('dotenv').config();
const cron = require('node-cron');

const {dailyText} = require('./crons/messages')
const {CRON_INTERVALS} = require('./constants')


//schedule tasks
cron.schedule(CRON_INTERVALS.EVERYMINUTE, dailyText);
