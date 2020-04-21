const {User, UserGuide, GuideDay, UserGuideDay, Message, Guide} = require('../models');
const {Op} = require('sequelize');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const moment = require('moment');
const {personalizeTextMessage, getTimezones, sendInternationalSms, getTwilioNumber, sendUndeliveredMessage} = require('../modules/twilio');
const urlShortener = require('../modules/urlShortener');
const shortener = new urlShortener();
const {imageExists, generateSmsAuthToken} = require('../modules/helpers');
const {MESSAGES_STATUSES, MESSAGES_TYPES, FAILED_MESSAGES_STATUSES} = require('../constants');

const sendUndeliveredDailyMessages = async () => {
  let dailyUndeliveredMessages = await Message.findAll({
    where: {
      status: {
        [Op.in]: FAILED_MESSAGES_STATUSES
      },
      type: MESSAGES_TYPES.DAILY,
      attempts_left: {
        [Op.gt]: 0
      }
    }
  });
  dailyUndeliveredMessages = dailyUndeliveredMessages
    .filter(message => {
      const diff = moment().diff(moment(message.updated_at), 'h');
      return diff === 1
    });
  await Promise.all(dailyUndeliveredMessages.map(message => sendUndeliveredMessage(message, client)))
};

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
    const [userGuide, guide] = await Promise.all([
      UserGuide.findOne({
        where: {
          guide_id: user.guide_id,
          user_id: user.id
        }
      }),
      Guide.findByPk(user.guide_id)
    ]);
    const trackingParams = encodeURIComponent(
      `utm_source=daily texts&utm_medium=${guide.name} texts&utm_campaign=0 texts`
    );

    /*
    IF IT IS THE LAST DAY
     */
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
        await UserGuideDay.create({
          user_id: user.id,
          guide_id: userGuide.guide_id,
          day: 22,
        });
        return;
      }
      const guideDay = await GuideDay.findOne({where: {day: 22, guide_id: userGuide.guide_id}});
      const smsAuthToken = await generateSmsAuthToken(user.id);
      const selectGuideUrl = `${process.env.BASE_URL}/guides/`;
      const messageUrl = await shortener.createShort(
        `${process.env.BASE_URL}?redirect_url=${selectGuideUrl}&uts=${smsAuthToken}&ui=${user.id}&${trackingParams}`,
        user.id
      );
      // send sms to select guide
      const messageText = personalizeTextMessage(user, guideDay.text_message);
      try {
        const messageObject = {
          from: await getTwilioNumber(client, user.phone),
          body: `${messageText}\n${messageUrl}`,
          to: user.phone,
          statusCallback: `${process.env.API_URL}/webhooks/twilio/status-callback/`,
          statusCallbackMethod: 'POST'
        };
        const response = await sendInternationalSms(client, messageObject);
        const message = await Message.create({
          user_id: user.id,
          from: messageObject.from,
          to: messageObject.to,
          text_message: messageObject.body,
          media_url: messageObject.mediaUrl || null,
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

    /*
    END OF LAST DAY LOGIC
     */

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
      const imageQuoteUrl = `${process.env.BASE_URL}/img/quotes/${guide.old_guide_id}/${dayToAssign}.png`;
      const imageIsExisting = await imageExists(imageQuoteUrl);

      const smsAuthToken = await generateSmsAuthToken(user.id);
      const guideUrl = `${process.env.BASE_URL}/guides/${guide.url_safe_name}/day-${dayToAssign}/`;
      const messageUrl = await shortener.createShort(
        `${process.env.BASE_URL}?redirect_url=${guideUrl}&uts=${smsAuthToken}&ui=${user.id}&${trackingParams}`,
        user.id
      );

      let message;
      try {
        const messageObject = {
          from: await getTwilioNumber(client, user.phone),
          body: `${messageText}\n${messageUrl}`,
          to: user.phone,
          statusCallback: `${process.env.API_URL}/webhooks/twilio/status-callback/`,
          statusCallbackMethod: 'POST',
        };
        if (imageIsExisting) {
          messageObject.mediaUrl = imageQuoteUrl; // make it this way pls
        }
        const response = await sendInternationalSms(client, messageObject);
        message = await Message.create({
          user_id: user.id,
          from: messageObject.from,
          to: messageObject.to,
          text_message: messageObject.body,
          media_url: messageObject.mediaUrl || null,
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
