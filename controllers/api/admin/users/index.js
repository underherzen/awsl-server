const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const models = require('../../../../models');
const { User, Subscription } = require('../../../../models');
const { toValidPhone } = require('../../../../modules/twilio');
const { calculateTrialDays } = require('../../../../modules/helpers');
const { STRIPE_STATUSES } = require('../../../../constants');
const moment = require('moment');

stripe.setTimeout(10000);

const loadUsers = async (req, res, next) => {
  try {
    const query = `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, g.name as 'current_guide', 
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
  console.log(user);
  try {
    const isValidPhone = toValidPhone(user.phone);
    if (!isValidPhone) {
      return res.send({ error: 'Phone number is invalid' }).status(400);
    }

    const subscription = await Subscription.findOne({ where: { user_id: id } });
    const newTrial = moment()
      .add(+user.trial_days, 'd')
      .add(1, 'minutes')
      .unix();

    const promises = [
      stripe.customers.update(subscription.customer, {
        email: user.email,
        name: user.first_name + ' ' + user.last_name,
      }),
      User.update(
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
      ),
    ];

    if (+user.trial_days === 0) {
      if (subscription.status === STRIPE_STATUSES.TRIALING) {
        promises.push(stripe.subscriptions.update(subscription.id, { trial_end: newTrial }));
      }
    } else {
      promises.push(stripe.subscriptions.update(subscription.id, { trial_end: newTrial }));
    }

    await Promise.all(promises);

    return res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadUsers,
  updateUser,
};
