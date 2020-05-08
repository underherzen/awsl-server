const { User } = require('../../../../models');
const stripe = require('stripe')(process.env.STRIPE_PRIVATE);
const { toValidPhone } = require('../../../../modules/api/auth');
const { userToFront } = require('../../../../modules/helpers');
const { Op } = require('sequelize');

const changeBio = async (req, res, next) => {
  try {
    let user = req.user;
    const body = req.body;
    const subscription = req.subscription;
    body.phone = toValidPhone(body.phone);

    if (!body.phone) {
      res.status(400).send({ error: 'Phone number is invalid' });
      return;
    }

    const existingUser = await User.findOne({
      where: {
        id: {
          [Op.ne]: user.id,
        },
        phone: body.phone,
      },
    });

    if (existingUser) {
      res.status(400).send({ error: 'User with provided phone number already exists' });
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
  } catch (e) {
    next(e);
  }
};

const changeEmail = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

module.exports = {
  changeBio,
  changeEmail,
};
