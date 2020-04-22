const {
  User,
  UserGuide,
  GuideDay,
  UserGuideDay,
  Message,
  Guide,
} = require('../../models');
const { Op } = require('sequelize');
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const moment = require('moment');
const {
  personalizeTextMessage,
  getTimezones,
  sendInternationalSms,
  getTwilioNumber,
  sendUndeliveredMessage,
  sendDailyText,
} = require('../../modules/twilio');
const urlShortener = require('../../modules/urlShortener');
const shortener = new urlShortener();
const { imageExists, generateSmsAuthToken } = require('../../modules/helpers');
const {
  MESSAGES_STATUSES,
  MESSAGES_TYPES,
  FAILED_MESSAGES_STATUSES,
} = require('../../constants');

const sendUndeliveredDailyMessages = async () => {
  let dailyUndeliveredMessages = await Message.findAll({
    where: {
      status: {
        [Op.in]: FAILED_MESSAGES_STATUSES,
      },
      type: MESSAGES_TYPES.DAILY,
      attempts_left: {
        [Op.gt]: 0,
      },
    },
  });
  dailyUndeliveredMessages = dailyUndeliveredMessages.filter((message) => {
    const diff = moment().diff(moment(message.updated_at), 'h');
    return diff >= 1;
  });
  await Promise.all(
    dailyUndeliveredMessages.map((message) =>
      sendUndeliveredMessage(message, client)
    )
  );
};

const sendFirstDailySms = async () => {
  const userIdsWithSentFirstSms = (
    await Message.findAll({
      where: {
        type: MESSAGES_TYPES.DAILY,
      },
      attributes: ['user_id'],
      group: ['user_id'],
    })
  ).map((el) => +el.user_id); // this makes unique array only with user_ids like [1, 2, 3]
  console.log(userIdsWithSentFirstSms);
  const usersToSend = await User.findAll({
    where: {
      id: {
        [Op.notIn]: userIdsWithSentFirstSms,
      },
      is_active: true,
      start_immediately: true,
      can_receive_texts: true,
      guide_id: {
        [Op.not]: null,
      },
    },
  });
  // console.log(usersToSend);
  await Promise.all(
    usersToSend.map(async (user) => {
      const [userGuide, guideDay, guide] = await Promise.all([
        UserGuide.findOne({
          where: {
            user_id: user.id,
            guide_id: user.guide_id,
          },
        }),
        GuideDay.findOne({
          where: {
            guide_id: user.guide_id,
            day: 1,
          },
        }),
        Guide.findByPk(user.guide_id),
      ]);

      const diff = moment().diff(moment(userGuide.created_at), 'minutes');
      console.log('DIFF')
      console.log(diff);
      if (diff !== 3) {
        return;
      }
      const message = await sendDailyText(user, guideDay, 1, guide, userGuide);
      console.log(message)
      if (message) {
        await UserGuideDay.update(
          {
            message_id: message.id,
          },
          {
            where: {
              user_id: user.id,
              guide_id: user.guide_id,
              day: 1,
            },
          }
        );
      }
    })
  );
};

const dailyText = async () => {
  const timezones = getTimezones(6);
  console.log('RUNNING DAILY-TEXT FROM TIMEZONE' + timezones);

  const users = await User.findAll({
    where: {
      timezone: {
        [Op.in]: timezones,
      },
      guide_id: {
        [Op.ne]: null,
      },
      is_active: true,
    },
  });

  console.log('FOUND USERS TO DAILY TEXT', users.length);
  await Promise.all(
    users.map(async (user) => {
      const [userGuide, guide] = await Promise.all([
        UserGuide.findOne({
          where: {
            guide_id: user.guide_id,
            user_id: user.id,
          },
        }),
        Guide.findByPk(user.guide_id),
      ]);
      /*
    IF IT IS THE LAST DAY
     */
      if (userGuide.day === 21) {
        const dbPromises = [
          UserGuide.update(
            { completed: true },
            { where: { id: userGuide.id } }
          ),
          User.update({ guide_id: null }, { where: { id: user.id } }),
        ];

        try {
          await Promise.all(dbPromises);
        } catch (e) {
          console.log('DB ERROR:');
          console.log(e);
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
        const guideDay = await GuideDay.findOne({
          where: { day: 22, guide_id: userGuide.guide_id },
        });
        const message = await sendDailyText(
          user,
          guideDay,
          22,
          guide,
          userGuide
        );
        await UserGuideDay.create({
          user_id: user.id,
          guide_id: userGuide.guide_id,
          day: 22,
          message_id: message ? message.id : null,
        });
        return;
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
          { day: dayToAssign },
          {
            where: {
              user_id: user.id,
              guide_id: user.guide_id,
            },
          }
        ),
      ];
      if (user.can_receive_texts) {
        const guideDay = await GuideDay.findOne({
          where: {
            day: dayToAssign,
            guide_id: user.guide_id,
          },
        });

        const message = await sendDailyText(
          user,
          guideDay,
          dayToAssign,
          guide,
          userGuide
        );

        dbPromises.push(
          UserGuideDay.create({
            guide_id: user.guide_id,
            day: dayToAssign,
            user_id: user.id,
            message_id: message ? message.id : null,
          })
        );
      } else {
        dbPromises.push(
          UserGuideDay.create({
            guide_id: user.guide_id,
            day: dayToAssign,
            user_id: user.id,
          })
        );
      }
      try {
        await Promise.all(dbPromises);
      } catch (e) {
        console.log('DB ERROR:');
        console.log(e);
      }
    })
  );
};

module.exports = {
  dailyText,
  sendFirstDailySms,
  sendUndeliveredDailyMessages,
};
