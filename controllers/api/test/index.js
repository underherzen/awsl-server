const { User } = require('../../../models');

const testConnection = async (req, res, next) => {
  try {
    await User.update({ can_receive_texts: false }, { where: {} });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  testConnection,
};
