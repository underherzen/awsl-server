const {User} = require('../models');
const {retrieveToken} = require('../modules/helpers');
const moment = require('moment');

const isUserActive = (req, res, next) => {
  if (!req.user.is_active) {
    res.sendStatus(401);
    return;
  }
  next();
};

const userIsAuth = async (req, res, next) => {
  const token = await retrieveToken(req.headers);
  if (!token) {
    res.sendStatus(401);
    return;
  }

  if (moment() > moment(token.expiry)) {
    res.sendStatus(401);
    return;
  }

  const user = await User.findByPk(token.user_id);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  req.user = user.dataValues;
  next()
};

module.exports= {
  isUserActive,
  userIsAuth
};
