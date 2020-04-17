// stripe subscriptions
const STRIPE_CONSTANTS = {
  plans: {
    annual_99: 'Annual_Plan_99',
    annual_79: 'Annual_Plan_79',
    new_annual: 'New_Annual',
  },
  name: 'LIU Annual Subscription',
  trialDays: 21
};

const STRIPE_STATUSES = {
  PAST_DUE: 'past_due',
  ACTIVE: 'active',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  PAUSED: 'paused',
  UNPAID: 'unpaid',
  CANCELED: 'canceled',
  INCOMPLETE_EXPIRED: 'incomplete_expired'
};

const ACTIVE_STATUSES = [
  STRIPE_STATUSES.PAST_DUE,
  STRIPE_STATUSES.ACTIVE,
  STRIPE_STATUSES.TRIALING,
  STRIPE_STATUSES.INCOMPLETE,
  STRIPE_STATUSES.PAUSED,
  STRIPE_STATUSES.INCOMPLETE_EXPIRED
];

const USER_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

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
};

module.exports = {
  STRIPE_CONSTANTS,
  USER_TYPES,
  ACTIVE_STATUSES,
  STRIPE_STATUSES,
  CRON_INTERVALS
};
