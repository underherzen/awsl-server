const {UserGuide, User, UserGuideDay, Guide, GuideDay} = require('../../../models');
const moment = require('moment');
const {Op} = require('sequelize');


const selectGuide = async (req, res, next) => {
  const body = req.body;
  let user = req.user;
  if (user.guide_id) {
    res.status(400).send({error: 'You already have guide'})
  }
  const guide = await Guide.findByPk(body.guide_id);

  if (!guide) {
    res.sendStatus(400);
    return;
  }

  const previousSameGuide = await UserGuide.findOne(
    {
      where: {
        user_id: user.id,
        guide_id: guide.id
      }
    }
  );

  if (previousSameGuide) {
    res.status(400).send({error: 'You have already passed this guide!'})
  }

  const dayToAssign = user.is_active ? 1 : 0;
  const promises = [
    UserGuide.create({
      user_id: user.id,
      guide_id: guide.id,
      day: dayToAssign
    }),
    UserGuideDay.create({
      user_id: user.id,
      guide_id: guide.id,
      day: dayToAssign
    }),
    User.update(
      {guide_id: guide.id},
      {where: {id: user.id}}
    )
  ];
  if (user.is_active) {
    promises.push(
      UserGuideDay.create({
        user_id: user.id,
        guide_id: guide.id,
        day: 0
      }))
  }
  // TODO: MAKE SENDING TEXTS
  await Promise.all(promises);
  user = await User.findByPk(user.id);
  res.send({user});


  // res.sendStatus(400);
};

const getGuideDay = async (req, res, next) => {
  const body = req.query;
  const guideDay = await GuideDay.findOne({
    where: {
      guide_id: body.guide_id,
      day: +body.day
    }
  });
  if (!guideDay) {
    res.sendStatus(404);
    return;
  }

  res.send({guide_day: guideDay});
};

const getGuideDaysForSlider = async (req, res, next) => {
  const body = req.query;
  if (!body.guide_id) {
    res.sendStatus(400);
    return
  }
  const guideDays = await GuideDay.findAll({
    attributes: ['title', 'day'],
    where: {
      guide_id: body.guide_id,
      day: {
        [Op.lt]: 22
      }
    }
  });
  if (!guideDays) {
    res.sendStatus(404);
    return
  }
  res.send({guide_days: guideDays})
};

module.exports = {
  selectGuide,
  getGuideDay,
  getGuideDaysForSlider
};
