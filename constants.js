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

const STATUSES = {
  PAST_DUE: 'past_due',
  ACTIVE: 'active',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  PAUSED: 'paused',
};

const ACTIVE_STATUSES = {
  PAST_DUE: 'past_due',
  ACTIVE: 'active',
  TRIALING: 'trialing',
  INCOMPLETE: 'incomplete',
  PAUSED: 'paused'
};

const USER_TYPES = {
  ADMIN: 'admin',
  USER: 'user',
  MODERATOR: 'moderator'
};

module.exports = {
  STRIPE_CONSTANTS,
  USER_TYPES,
  ACTIVE_STATUSES
};
