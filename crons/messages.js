const {User, UserGuide, GuideDay, UserGuideDay} = require('../models');
const {Op} = require('sequelize');
const {personalizeTextMessage} = require('../modules/crons');

const getTimezones = sendTime => {
  const date = new Date();

  const offsetHours = date.getUTCHours() - sendTime;
  const tz = offsetHours < 0 ? offsetHours + 24 : offsetHours - 24;

  const offsetMinutes = date.getUTCMinutes();
  const timezones = [offsetHours, tz]
    .filter(el => Math.abs(el) <= 12)
    .map(el => el < 0 ? 60 * el + offsetMinutes : 60 * el - offsetMinutes);
  return timezones
};

const dailyText = async () => {

  const timezones = getTimezones(15);
  console.log('RUNNING DAILY-TEXT FROM TIMEZONE' + timezones);
  const users = await User.findAll({
    where: {
      [Op.in]: {
        timezone: timezones
      },
      [Op.ne]: {
        guide_id: null
      },
      is_active: true
    }
  });
  console.log('FOUND USERS TO DAILY TEXT', users.length);
  await Promise.all(users.map(async user => {
    const userGuide = await UserGuide.findByPk(user.guide_id);
    if (userGuide.day === 21) {

      const dbPromises = [
        UserGuide.update(
          {completed: true},
          {where: {id: userGuide.id}}
        ),
        User.update(
          {guide_id: null},
          {where: {id: user.id}}
        )
      ];

      try {
        await Promise.all(dbPromises);
      } catch (e) {
        console.log('DB ERROR:');
        console.log(e)
      }

      // if user can receive texts then send one
      if (!user.can_receive_texts) {
        return;
      }
      // send sms to select guide
    }

    let dayToAssign = userGuide.day + 1;
    // prevent from over going just in case
    if (dayToAssign > 21) {
      dayToAssign = 21;
    }

    const dbPromises = [
      UserGuide.update(
        {day: dayToAssign},
        {
          where: {
            user_id: user.id,
            guide_id: user.guide_id
          }
        }
      )
    ];
    if (user.can_receive_texts) {
      const guideDay = await GuideDay.findOne({
        where: {
          day: dayToAssign,
          guide_id: user.guide_id
        }
      });
      const message = personalizeTextMessage(user, guideDay.text_message);
      // send message

      dbPromises.push(
        UserGuideDay.create({

        })
      )


    }



  }))
};


module.exports = {
  dailyText
};
