// stripe subscriptions
const STRIPE_CONSTANTS = {
  plans: {
    annual_99: 'Annual_Plan_99',
    annual_79: 'Annual_Plan_79',
    new_annual: 'New_Annual',
  },
  name: 'LIU Annual Subscription',
  trialDays: 21,
};

const STRIPE_STATUSES = {
  PAST_DUE: 'past_due',
  ACTIVE: 'active',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  PAUSED: 'paused',
  UNPAID: 'unpaid',
  CANCELED: 'canceled',
  INCOMPLETE_EXPIRED: 'incomplete_expired',
};

const ACTIVE_STATUSES = [
  STRIPE_STATUSES.PAST_DUE,
  STRIPE_STATUSES.ACTIVE,
  STRIPE_STATUSES.TRIALING,
  STRIPE_STATUSES.INCOMPLETE,
  STRIPE_STATUSES.PAUSED,
  STRIPE_STATUSES.INCOMPLETE_EXPIRED,
];

const INACTIVE_STATUSES = [STRIPE_STATUSES.UNPAID, STRIPE_STATUSES.CANCELED];

const USER_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator',
};

const TOKEN_TYPES = {
  RESET_PASSWORD: 'reset_password',
  SMS_AUTH: 'sms_auth', // these tokens work forever FOR NOW
};

const MESSAGES_TYPES = {
  DAILY: 'daily',
  WELCOME: 'welcome',
  REPLY_YES: 'reply_yes',
  REPLY_STOP: 'reply_stop',
  REPLY_UNSTOP: 'reply_unstop',
  REPLY_HELP: 'reply_help',
  DISCOUNT: 'discount',
  AFTER_FIRST_DAILY_MESSAGE: 'after_first_daily_message',
  ADDITIONAL: 'additional',
};

const MESSAGES_STATUSES = {
  ACCEPTED: 'accepted',
  QUEUED: 'queued',
  SENDING: 'sending',
  SENT: 'sent',
  FAILED: 'failed',
  DELIVERED: 'delivered',
  UNDELIVERED: 'undelivered',
  RECEIVING: 'receiving',
  RECEIVED: 'received',
  READ: 'read',
};

const FAILED_MESSAGES_STATUSES = [MESSAGES_STATUSES.FAILED, MESSAGES_STATUSES.UNDELIVERED];

const CRON_INTERVALS = {
  EVERYSECOND: '* * * * * *',
  EVERY2SECONDS: '*/2 * * * * *',
  EVERY4SECONDS: '*/4 * * * * *',
  EVERY10SECONDS: '*/10 * * * * *',
  EVERY3SECONDS: '*/3 * * * * *',
  EVERY30SECONDS: '*/30 * * * * *',
  EVERYMINUTE: '*/1 * * * *',
  EVERY10MINUTES: '*/10 * * * *',
  EVERY1HOUR: '1 * * * *',
  EVERYDAYAT7AMUTC: '0 7 * * *',
  EVERYDAYAT10AMUTC: '0 10 * * *',
  EVERYDAYAT1AMUTC: '0 1 * * *',
  EVERY5MINUTES: '*/5 * * * *',
};

const REPLY_TEXTS = {
  YES: `Let’s go! First challenge is coming soon! Start by saving us in your phone as LiveItUp (we’re besties now!). Done? Great! Now, click the link to join the LiveItUp community. (step 2 of 2): {1}`,

  STOP:
    'We’re sad to see you go {0}! This means that you won’t be receiving challenges via text from LiveItUp.' +
    ' If you would still like to receive texts please reply UNSTOP to start receiving texts from LiveItUp again at any' +
    ' time. Challenges will still be available in your members area until your membership is complete. Can we ask—why' +
    ' did you decided to stop texts from LiveItUp?',

  HELP: 'We’re here for you {0}. Email us at aly@goliveitup.com, and we’ll get back to you ASAP.',

  UNSTOP: 'We missed you! So glad to see you back. Pick your next challenge here: {0}',

  COMMUNITY: `Hi, Radha here with LiveItUp! Thanks for texting! Are you ready to take action and find your dream community with my 21-Day Challenge? Here’s how to join:
1. Go to the link below
2. Click Start Free Trial
3. Set your start date to 4/9
4. Choose the Belong: Find Your People Challenge
Your journey to find your people starts Monday! And so does your 7 day FREE Trial :) I’ll see you then in our online community—can’t wait to connect. Let's GO!! https://goliveitup.com/?_from=radha&signup=true`,
};

const REPLY_COMMANDS = {
  YES: 'YES',
  STOP: 'STOP',
  UNSTOP: 'UNSTOP',
  HELP: 'HELP',
  COMMUNITY: 'COMMUNITY',
};

const COUPONS_DURATIONS = {
  FOREVER: 'forever',
};

const DISCOUNT_DAY = 14;
const LAST_TRIAL_DAY = STRIPE_CONSTANTS.trialDays;

const LAST_DEFAULT_TRIAL_DAY_HOURS = [...Array(24).keys()].map((i) => i + 24 * LAST_TRIAL_DAY);

const DISCOUNT_DAY_HOURS = [...Array(24).keys()].map((i) => i + 24 * DISCOUNT_DAY);

const ONTRAPORT_HEADERS = {
  'Api-Appid': process.env.ONTRAPORT_API_APPID,
  'Api-Key': process.env.ONTRAPORT_API_KEY,
  'Content-Type': 'application/x-www-form-urlencoded',
};

module.exports = {
  STRIPE_CONSTANTS,
  USER_TYPES,
  ACTIVE_STATUSES,
  STRIPE_STATUSES,
  CRON_INTERVALS,
  INACTIVE_STATUSES,
  TOKEN_TYPES,
  MESSAGES_TYPES,
  MESSAGES_STATUSES,
  FAILED_MESSAGES_STATUSES,
  REPLY_TEXTS,
  REPLY_COMMANDS,
  COUPONS_DURATIONS,
  LAST_DEFAULT_TRIAL_DAY_HOURS,
  DISCOUNT_DAY_HOURS,
  ONTRAPORT_HEADERS,
};
