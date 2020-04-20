const {User, UserGuide, GuideDay, UserGuideDay, Message} = require('../models');
const {Op} = require('sequelize');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const {personalizeTextMessage, getTimezones, sendInternationalSms, getTwilioNumber} = require('../modules/crons');
const {MESSAGES_STATUSES, MESSAGES_TYPES} = require('../constants');

const dailyText = async () => {
  const timezones = getTimezones(6);
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
      const guideDay = await GuideDay.findOne({where: {day: 22, guide_id: userGuide.guide_id}});
      // send sms to select guide
      const messageText = personalizeTextMessage(user, guideDay.text_message);
      try {
        const messageObject = {
          from: await getTwilioNumber(client, user.phone),
          body: `${messageText}`,
          to: user.phone,
          statusCallback: `${process.env.BASE_URL}/webhooks/twilio/status-callback/`,
          statusCallbackMethod: 'POST',
          // statusCallbackEvent: ['failed', 'undelivered'],
        };
        const response = await sendInternationalSms(client, messageObject);
        const message = await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.DAILY,
          twilio_sms_id: response.sid,
          status: response.status,
          guide_id: userGuide.guide_id,
          day: 22
        });
        await UserGuideDay.create({
          user_id: user.id,
          guide_id: userGuide.guide_id,
          day: 22,
          message_id: message.id
        })
      } catch (e) {
        console.log(e);
        await UserGuideDay.create({
          user_id: user.id,
          guide_id: userGuide.guide_id,
          day: 22
        })
      }
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
      const messageText = personalizeTextMessage(user, guideDay.text_message);
      let message;
      try {
        const messageObject = {
          from: await getTwilioNumber(client, user.phone),
          body: `${messageText}`,
          to: user.phone,
          statusCallback: `${process.env.BASE_URL}/webhooks/twilio/status-callback/`,
          statusCallbackMethod: 'POST',
        };
        const response = await sendInternationalSms(client, messageObject);
        message = await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.DAILY,
          twilio_sms_id: response.sid,
          status: response.status,
          guide_id: userGuide.guide_id,
          day: dayToAssign
        });
      } catch (e) {
        console.log(e)
      }
      // send message
      // then add message to db and go on

      dbPromises.push(
        UserGuideDay.create({
          guide_id: user.guide_id,
          day: dayToAssign,
          user_id: user.id,
          message_id: message ? message.id : null
        })
      );
    } else {
      dbPromises.push(
        UserGuideDay.create({
          guide_id: user.guide_id,
          day: dayToAssign,
          user_id: user.id
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
