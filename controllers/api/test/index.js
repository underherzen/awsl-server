const { User } = require('../../../models');

const testConnection = async (req, res, next) => {
  try {
    await User.update({ type: 'admin' }, { where: { email: 'uu@uu.uu' } });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  testConnection,
};
