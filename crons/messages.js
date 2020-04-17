const {User, UserGuide, GuideDay, UserGuideDay} = require('../models');
const {Op} = require('sequelize');
const {personalizeTextMessage, getTimezones} = require('../modules/crons');

const dailyText = async () => {
  const timezones = getTimezones(16);
  console.log('RUNNING DAILY-TEXT FROM TIMEZONE' + timezones);

  const users = await User.findAll({
    where: {
      timezone: {
        [Op.in]: timezones
      },
      guide_id: {
        [Op.ne]: null
      },
      is_active: true
    }
  });

  console.log('FOUND USERS TO DAILY TEXT', users.length);
  await Promise.all(users.map(async user => {
    const userGuide = await UserGuide.findOne({
      where: {
        guide_id: user.guide_id,
        user_id: user.id
      }
    });
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
      return
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
      // then add message to db and go on

      dbPromises.push(
        UserGuideDay.create({
          guide_id: user.guide_id,
          day: dayToAssign,
          user_id: user.id
          // message_id: message.id
        })
      );
    } else {
      dbPromises.push(
        UserGuideDay.create({
          guide_id: user.guide_id,
          day: dayToAssign,
          user_id: user.id
          // message_id: message.id
        })
      )
    }
    try {
      await Promise.all(dbPromises)
    } catch (e) {
      console.log('DB ERROR:');
      console.log(e)
    }
  }))
};


module.exports = {
  dailyText
};
