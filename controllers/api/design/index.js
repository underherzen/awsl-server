const { User } = require('../../../models');
const { userToFront } = require('../../../modules/helpers');

const chooseNewDesign = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

const returnOld = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

const rejectSuggestion = async (req, res, next) => {
  try {
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
  } catch (e) {
    next(e);
  }
};

module.exports = {
  chooseNewDesign,
  returnOld,
  rejectSuggestion,
};
