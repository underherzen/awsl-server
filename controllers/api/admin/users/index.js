const { User } = require('../../../../models');

const loadUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'phone', 'first_name', 'last_name', 'is_active'],
    });

    res.send({ users });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  loadUsers,
};
