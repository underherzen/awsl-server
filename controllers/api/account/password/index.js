const {User, Token} = require('../../../../models');
const sgMail = require('@sendgrid/mail');
const moment = require('moment');
const bcrypt = require('bcryptjs');
const {TOKEN_TYPES} = require('../../../../constants');
const {generateRandString} = require('../../../../modules/helpers');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendResetPasswordEmail = async (req, res, next) => {
  const body = req.query;
  if (!body.email) {
    res.status(400).send({error: 'E-mail must not be empty'});
    return;
  }

  const user = await User.findOne({where: {email: body.email}});
  if (!user) {
    res.status(404).send({error: 'User with provided email has no found'});
    return;
  }

  let doNext = true;
  let count = 0;
  let token;

  while (doNext && count < 10) {
    token = generateRandString();
    try {
      await Token.create({
        user_id: user.id,
        token,
        type: TOKEN_TYPES.RESET_PASSWORD,
        expiry: moment().add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss')
      });
      doNext = false;
    } catch (e) {
      count += 1;
      if (count === 10) {
        res.sendStatus(500); // to prevent from overdoing
        return;
      }
      console.log(e)
    }
  }

  const url = `${process.env.BASE_URL}/?reset_password=${token}`;

  const msg = {
    to: body.email,
    from: process.env.EMAIL,
    subject: 'Reset password',
    text: 'Please follow this link',
    html: `Please follow this link <a href="${url}">${url}</a>`,
  };

  await sgMail.send(msg);
  res.send({message: 'Email has been sent'});
};

const resetPassword = async (req, res, next) => {
  const body = req.body;
  console.log(body);

  if (!body.password || !body.confirm_password || !body.token) {
    res.sendStatus(400);
    return;
  }

  const token = await Token.findOne({
    where: {
      token: body.token,
      type: TOKEN_TYPES.RESET_PASSWORD,
      is_used: false
    }
  });

  if (!token) {
    res.status(404).send({error: 'Reset token has no found'});
    return;
  }

  if (body.password !== body.confirm_password) {
    res.status(400).send({error: 'Passwords must be equal'});
    return;
  }

  if (moment() > moment(token.expiry)) {
    res.status(400).send({error: 'Token has expired'});
    return;
  }

  const newPassword = await bcrypt.hash(body.password, 10);

  await Promise.all([
    User.update(
      {password: newPassword},
      {where: {id: token.user_id}}
    ),
    Token.update(
      {is_used: true},
      {where: {id: token.id}}
    )
  ]);
  res.send({message: 'Password has been reset'})

};

const changePassword = async (req, res, next) => {
  const body = req.body;
  let user = req.user;
  console.log(body)

  const passwordsAreEqual = await bcrypt.compare(body.old_password, user.password);
  console.log(passwordsAreEqual)

  if (!passwordsAreEqual) {
    res.status(400).send({error: 'Old password doesn`t match'});
    return;
  }

  if (body.password !== body.confirm_password) {
    res.status(400).send({error: 'Passwords don`t match'});
    return;
  }

  const newPassword = await bcrypt.hash(body.password, 10);
  await User.update({password: newPassword}, {where: {id: user.id}});
  res.send({message: 'Password has changed'})
};

module.exports = {
  sendResetPasswordEmail,
  resetPassword,
  changePassword
};
