const { userToFront } = require("../../../modules/helpers");
const moment = require("moment");
const { Op } = require("sequelize");
const { retrieveToken } = require("../../../modules/api/auth");
const {
  UserGuide,
  User,
  UserGuideDay,
  Guide,
  GuideDay,
  ResetCurrentCourseToken,
} = require("../../../models");
const _ = require("lodash");

const loadGuides = async (req, res, next) => {
  const guides = await Guide.findAll();
  res.send(guides);
};

const selectGuide = async (req, res, next) => {
  const { body, headers } = req;
  let { user } = req;

  const token = await retrieveToken(headers);

  if (!token) {
    res.sendStatus(401);
    return;
  }

  if (user.guide_id) {
    res.status(400).send({ error: "You already have guide" });
    return;
  }

  const guide = await Guide.findByPk(body.guide_id);

  if (!guide) {
    res.sendStatus(400);
    return;
  }

  const previousSameGuide = await UserGuide.findOne({
    where: {
      user_id: user.id,
      guide_id: guide.id,
    },
  });

  if (previousSameGuide) {
    res.status(400, { error: "You have already passed this guide!" });
    return;
  }

  const dayToAssign = user.is_active ? 1 : 0;
  const promises = [
    UserGuide.create({
      user_id: user.id,
      guide_id: guide.id,
      day: dayToAssign,
    }),
    UserGuideDay.create({
      user_id: user.id,
      guide_id: guide.id,
      day: dayToAssign,
    }),
    User.update({ guide_id: guide.id }, { where: { id: user.id } }),
  ];

  if (user.is_active) {
    promises.push(
      UserGuideDay.create({
        user_id: user.id,
        guide_id: guide.id,
        day: 0,
      })
    );
  }
  // TODO: MAKE SENDING TEXTS
  await Promise.all(promises);

  user = await userToFront(token.user_id);
  const redirect = `/guides/${guide.url_safe_name}/intro/`;

  res.send({ user, redirect });
  // res.sendStatus(400);
};

const getGuideDay = async (req, res, next) => {
  const body = req.query;
  const guideDay = await GuideDay.findOne({
    where: {
      guide_id: body.guide_id,
      day: +body.day,
    },
  });
  if (!guideDay) {
    res.sendStatus(404);
    return;
  }

  res.send({ guide_day: guideDay });
};

const acceptGuideDay = async (req, res, next) => {
  const { day_to_accept, guide_id } = req.body;
  let { user } = req;

  if (_.isUndefined(day_to_accept) || _.isUndefined(guide_id)) {
    res.status(400).send({ error: "Bad request!" });
    return;
  }

  const acceptedGuideDay = await UserGuideDay.update(
    { accepted: true },
    {
      where: {
        user_id: user.id,
        guide_id: Number(guide_id),
        day: Number(day_to_accept),
      },
    }
  );

  if (!acceptedGuideDay) {
    res.sendStatus(404);
    return;
  }

  user = await userToFront(user.id);
  res.status(200).send({ user });
};

const getGuideDaysForSlider = async (req, res, next) => {
  const body = req.query;
  if (!body.guide_id) {
    res.sendStatus(400);
    return;
  }
  const guideDays = await GuideDay.findAll({
    attributes: ["title", "day"],
    where: {
      guide_id: body.guide_id,
      day: {
        [Op.lt]: 22,
      },
    },
  });

  if (!guideDays) {
    res.sendStatus(404);
    return;
  }

  res.send({ guide_days: guideDays });
};

const resetGuide = async (req, res, next) => {
  let user = req.user;
  const body = req.body;

  if (!user.guide_id) {
    res.status(400).send({ error: "You don`t have any guides now" });
    return;
  }

  if (!body.token) {
    res.sendStatus(400);
    return;
  }

  const token = await ResetCurrentCourseToken.findOne({
    where: { token: body.token },
  });
  console.log(token);

  if (!token || moment() > moment(token.expiry) || token.attempts_left === 0) {
    res.status(400).send({ error: "You can`t reset course now" });
    return;
  }

  await Promise.all([
    UserGuide.destroy({
      where: {
        user_id: user.id,
        guide_id: user.guide_id,
      },
    }),
    UserGuideDay.destroy({
      where: {
        user_id: user.id,
        guide_id: user.guide_id,
      },
    }),
    User.update(
      { guide_id: null },
      {
        where: {
          id: user.id,
        },
      }
    ),
    ResetCurrentCourseToken.update(
      {
        attempts_left: token.attempts_left - 1,
      },
      {
        where: {
          user_id: user.id,
        },
      }
    ),
  ]);

  user = await userToFront(user.id);
  res.send({ user });
};

module.exports = {
  selectGuide,
  getGuideDay,
  getGuideDaysForSlider,
  loadGuides,
  resetGuide,
  acceptGuideDay,
};
