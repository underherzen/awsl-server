const { User } = require('../../../models');

const testConnection = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.send(users);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  testConnection,
};
