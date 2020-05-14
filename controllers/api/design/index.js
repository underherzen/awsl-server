const asyncHandler = require('express-async-handler');
const { User } = require('../../../models');
const { userToFront } = require('../../../modules/helpers');

const chooseNewDesign = asyncHandler(async (req, res, next) => {
  let user = req.user;
  await User.update(
    {
      new_design: true,
      suggest_new_design: false,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  user = await userToFront(user.id);
  res.send({ user });
});

const returnOld = asyncHandler(async (req, res, next) => {
  let user = req.user;
  await User.update(
    {
      new_design: false,
      suggest_new_design: false,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  user = await userToFront(user.id);
  res.send({ user });
});

const rejectSuggestion = asyncHandler(async (req, res, next) => {
  let user = req.user;
  await User.update(
    {
      new_design: false,
      suggest_new_design: false,
    },
    {
      where: {
        id: user.id,
      },
    }
  );

  user = await userToFront(user.id);
  res.send({ user });
});

module.exports = {
  chooseNewDesign,
  returnOld,
  rejectSuggestion,
};
