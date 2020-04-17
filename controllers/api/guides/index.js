const {UserGuide, User, UserGuideDay, Guide, GuideDay} = require('../../../models');
const moment = require('moment');


const selectGuide = async (req, res, next) => {
  const body = req.body;
  let user = req.user;
  if (user.guide_id) {
    res.status(400).send({error: 'You already have guide'})
  }
  const guide = await Guide.findByPk(body.guideId);

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

  let dayToAssign = user.is_active ? 1 : 0;
  // TODO: MAKE SENDING TEXTS
  await Promise.all([
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
  ]);
  user = await User.findByPk(user.id);
  res.send({user});


  // res.sendStatus(400);
};

const getGuideDay = async (req, res, next) => {
  const body = req.query;
  const guideDay = await GuideDay.findOne({
    where: {
      guide_id: body.guideId,
      day: +body.day
    }
  });
  if (!guideDay) {
    res.sendStatus(404);
    return;
  }

  res.send({guide_day: guideDay});
};

module.exports = {
  selectGuide,
  getGuideDay
};
