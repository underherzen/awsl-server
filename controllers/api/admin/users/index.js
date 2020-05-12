const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const models = require('../../../../models');
const { User, Subscription } = require('../../../../models');
const { calculateTrialDays } = require('../../../../modules/helpers');
const moment = require('moment');

stripe.setTimeout(10000);

const loadUsers = async (req, res, next) => {
  try {
    const query = `SELECT u.id, u.email, u.first_name, u.phone, g.name as 'current_guide', 
                          ud.day as 'current_guide_day', s.status, s.next_payment, u.created_at FROM users u
                   LEFT JOIN guides g ON g.id=u.guide_id
                   LEFT JOIN user_guides ud ON ud.user_id=u.id and ud.guide_id=g.id
                   LEFT JOIN subscriptions s ON s.user_id=u.id;`;

    let [users] = await models.sequelize.query(query);

    users = users.map((user) => {
      const { status, next_payment } = user;
      user.trial_days = calculateTrialDays({ status, next_payment });
      return user;
    });

    res.send({ users });
  } catch (e) {
    next(e);
  }
};

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  const { user } = req.body;
  try {
    await User.update(
      {
        email: user.email,
        first_name: user.first_name,
        phone: user.phone,
      },
      {
        where: {
          id,
        },
      }
    );

    const subscription = await Subscription.findOne({ where: { user_id: id } });
    const { status, next_payment } = subscription;

    const currentTrialDays = calculateTrialDays({ status, next_payment });
    const difference = user.trial_days - currentTrialDays;
    const newTrialEnd = moment(next_payment).add(difference, 'days').unix();

    await stripe.subscriptions.update(subscription.id, { trial_end: newTrialEnd });
    await stripe.customers.update(subscription.customer, {
      email: user.email,
    });

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadUsers,
  updateUser,
};
