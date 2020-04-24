const { userToFront } = require('../../../modules/helpers');
const { sendWelcomeMessage } = require('../../../modules/api/guides');
const { getTwilioNumber, sendDailyText } = require('../../../modules/twilio');
const moment = require('moment');
const { Op } = require('sequelize');
const { retrieveToken } = require('../../../modules/api/auth');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { UserGuide, User, UserGuideDay, Guide, GuideDay, ResetCurrentCourseToken, Message } = require('../../../models');
const { MESSAGES_TYPES } = require('../../../constants');
const _ = require('lodash');

const loadGuides = async (req, res, next) => {
  const guides = await Guide.findAll();
  res.send(guides);
};

const selectGuide = async (req, res, next) => {
  const { body } = req;
  let { user } = req;

  if (user.guide_id) {
    res.status(400).send({ error: 'You already have guide' });
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
    res.status(400, { error: 'You have already passed this guide!' });
    return;
  }

  const existingWelcomeMessage = await Message.findOne({
    where: {
      user_id: user.id,
      type: MESSAGES_TYPES.WELCOME,
    },
  });

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
      day: 0,
    }),
    User.update({ guide_id: guide.id }, { where: { id: user.id } }),
  ];

  if (user.is_active) {
    promises.push(
      UserGuideDay.create({
        user_id: user.id,
        guide_id: guide.id,
        day: 1,
      })
    );
  }
  // TODO: MAKE SENDING TEXTS
  await Promise.all(promises);

  // send welcome sms if it's first guide
  if (!existingWelcomeMessage) {
    await sendWelcomeMessage(user);
  } else if (user.is_active && user.can_receive_texts) {
    // send actual sms
    const [guideDay, userGuide] = await Promise.all([
      GuideDay.findOne({
        where: {
          guide_id: guide.id,
          day: 1,
        },
      }),
      UserGuide.findOne({
        where: {
          user_id: user.id,
          guide_id: guide.id,
        },
      }),
    ]);
    const message = await sendDailyText(user, guideDay, 1, guide, userGuide);
    if (message) {
      await UserGuideDay.update(
        {
          message_id: message.id,
        },
        {
          where: {
            user_id: user.id,
            guide_id: guide.id,
            day: 1,
          },
        }
      );
    }
  }

  user = await userToFront(user.id);
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
    res.status(400).send({ error: 'Bad request!' });
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
  res.send({ user });
};

const visitGuideDay = async (req, res, next) => {
  const { day_to_visit, guide_id } = req.body;
  let { user } = req;

  if (_.isUndefined(day_to_visit) || _.isUndefined(guide_id)) {
    res.status(400).send({ error: 'Bad request!' });
    return;
  }

  const visitedGuideDay = await UserGuideDay.update(
    { visited: true },
    {
      where: {
        user_id: user.id,
        guide_id: Number(guide_id),
        day: Number(day_to_visit),
      },
    }
  );

  if (!visitedGuideDay) {
    res.sendStatus(404);
    return;
  }

  user = await userToFront(user.id);
  res.send({ user });
};

const getGuideDaysForSlider = async (req, res, next) => {
  const body = req.query;
  if (!body.guide_id) {
    res.sendStatus(400);
    return;
  }
  const guideDays = await GuideDay.findAll({
    attributes: ['title', 'day'],
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
    res.status(400).send({ error: 'You don`t have any guides now' });
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
    res.status(400).send({ error: 'You can`t reset course now' });
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

const selectPrevious = async (req, res, next) => {
  let user = req.user;
  const body = req.body;

  if (!body.guide_id) {
    res.status(400).send({ error: 'Guide id is required' });
    return;
  }

  const userGuide = await UserGuide.findOne({
    where: {
      guide_id: body.guide_id,
      user_id: user.id,
    },
  });

  if (!userGuide) {
    res.status(400).send({ error: "It's not your previous guide!" });
    return;
  }

  // destroy all previous
};

module.exports = {
  selectGuide,
  getGuideDay,
  getGuideDaysForSlider,
  loadGuides,
  resetGuide,
  acceptGuideDay,
  visitGuideDay,
};
