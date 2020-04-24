const { User, Subscription, SubscriptionNotification } = require('../../models');
const moment = require('moment');
const { Op } = require('sequelize');
const { STRIPE_STATUSES, LAST_DEFAULT_TRIAL_DAY_HOURS, DISCOUNT_DAY_HOURS } = require('../../constants');

const checkUsersSubscriptions = async () => {
  const users = await User.findAll({
    where: {},
  });
};

`
SELECT * FROM users AS u, subscriptions AS s WHERE u.is_active=false AND u.start_immediately=false AND id IN (SELECT id FROM subscriptions WHERE status=trialing)
`;

const checkUserStartDay = async () => {
  const users = await User.findAll({
    where: {
      start_immediately: false,
      is_active: false,
      start_day: {
        [Op.lte]: moment().toDate(),
      },
    },
  });
  await Promise.all(
    users.map(async (user) => {
      const subscription = await Subscription.findOne({
        where: { user_id: user.id },
      });
      if (subscription.status !== STRIPE_STATUSES.TRIALING) {
        return;
      }
      return User.update({ is_active: true }, { where: { id: user.id } });
    })
  );
};

const subscriptionNotifications = async () => {
  const subscriptions = await Subscription.findAll({
    where: {
      [Op.or]: [{ status: STRIPE_STATUSES.CANCELED }, { status: STRIPE_STATUSES.TRIALING }],
      [Op.or]: [{ is_free_reg: null }, { is_free_reg: false }],
      last4: null,
    },
  });
  // console.log(subscriptions);
  await Promise.all(
    subscriptions.map(async (subscription) => {
      if (subscription.status === STRIPE_STATUSES.CANCELED) {
        return SubscriptionNotification.update(
          {
            discount_modal: false,
            end_of_subscription: true,
            last_trial_day: false,
          },
          {
            where: {
              user_id: subscription.user_id,
            },
          }
        );
      }

      const diff = moment(subscription.next_payment).diff(moment(), 'd');
      console.log('DIFF', diff);
      if (diff === 0) {
        return SubscriptionNotification.update(
          {
            discount_modal: false,
            end_of_subscription: false,
            last_trial_day: true,
          },
          {
            where: {
              user_id: subscription.user_id,
            },
          }
        );
      } else if (diff === 7) {
        return SubscriptionNotification.update(
          {
            discount_modal: true,
            end_of_subscription: false,
            last_trial_day: false,
          },
          {
            where: {
              user_id: subscription.user_id,
            },
          }
        );
      }
      return SubscriptionNotification.update(
        {
          discount_modal: false,
          end_of_subscription: false,
          last_trial_day: false,
        },
        {
          where: {
            user_id: subscription.user_id,
          },
        }
      );
    })
  );
};

module.exports = {
  checkUserStartDay,
  subscriptionNotifications,
};
