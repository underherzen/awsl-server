const { User, Subscription } = require('../../../../models');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const { toValidPhone } = require('../../../../modules/api/auth');
const { userToFront } = require('../../../../modules/helpers');
const changeBio = async (req, res, next) => {
  let user = req.user;
  const body = req.body;
  const subscription = req.subscription;
  body.phone = toValidPhone(body.phone);

  if (!body.phone) {
    res.status(400).send({ error: 'Phone number is invalid' });
    return;
  }

  await Promise.all([
    User.update(
      {
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
      },
      { where: { id: user.id } }
    ),
    stripe.customers.update(subscription.customer, {
      name: body.first_name + ' ' + body.last_name,
      phone: body.phone,
    }),
  ]);

  user = await userToFront(user.id);
  res.send({ user });
};

const changeEmail = async (req, res, next) => {
  let user = req.user;
  const body = req.body;
  const subscription = req.subscription;

  if (!body.email) {
    res.status(400).send({ error: 'Email must not be empty' });
    return;
  }

  const existingUser = await User.findOne({ where: { email: body.email } });
  if (existingUser) {
    res.status(400).send({ error: 'User with provided email already exists' });
    return;
  }

  if (body.email !== body.confirm_email) {
    res.status(400).send({ error: 'Emails don`t match!' });
    return;
  }

  await Promise.all([
    User.update(
      {
        email: body.email,
      },
      { where: { id: user.id } }
    ),
    stripe.customers.update(subscription.customer, {
      email: body.email,
    }),
  ]);

  user = await userToFront(user.id);
  res.send({ user });
};

module.exports = {
  changeBio,
  changeEmail,
};
