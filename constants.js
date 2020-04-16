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

module.exports = {
  STRIPE_CONSTANTS,
  USER_TYPES,
  ACTIVE_STATUSES,
  STRIPE_STATUSES
};
