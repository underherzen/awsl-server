const { User, Subscription } = require('../../models');
const moment = require('moment');
const { Op } = require('sequelize');

const checkUsersSubscriptions = async () => {
  const users = await User.findAll({
    where: {},
  });
};

const checkUserStartDay = async () => {
  const users = await User.findAll({
    where: {
      start_immediately: false,
      is_active: false,
      start_day: {
        [Op.lte]: moment().toDate(),
      },
    },
  });
  await Promise.all(
    users.map((user) =>
      User.update(
        {
          is_active: true,
        },
        {
          where: { id: user.id },
        }
      )
    )
  );
};

module.exports = {
  checkUserStartDay,
};
