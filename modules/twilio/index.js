const { Message } = require('../../models');
const urlShortener = require('../urlShortener');
const shortener = new urlShortener();
const { generateSmsAuthToken, imageExists } = require('../helpers');
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { MESSAGES_TYPES } = require('../../constants');

const personalizeTextMessage = (user, textMessage) => {
  user.firstName = user.first_name;
  return Object.keys(user).reduce((string, propertyName) => {
    // This normalizes the property names and makes the regex a lot more relaxed.
    // For example, with this, all of the following work: @[firstname], @[first Name], @[FiRsT   nAmE], etc
    const textPropertyName = propertyName.replace(/([a-z])([A-Z])/g, '$1\\s*$2');
    return string.replace(new RegExp(`@\\[${textPropertyName}]`, 'ig'), user[propertyName]);
  }, textMessage);
};

const getTimezones = (sendTime) => {
  const date = new Date();

  const offsetHours = date.getUTCHours() - sendTime;
  const tz = offsetHours < 0 ? offsetHours + 24 : offsetHours - 24;

  const offsetMinutes = date.getUTCMinutes();
  const timezones = [offsetHours, tz]
    .filter((el) => Math.abs(el) <= 12)
    .map((el) => (el < 0 ? 60 * el + offsetMinutes : 60 * el - offsetMinutes));
  return timezones;
};

const sendInternationalSms = async (client, messageObject) => {
  let res;
  messageObject.mediaUrl = 'http://127.0.0.1:4313/1.png'; // THIS IS FOR FREE  TESTING :)))))
  try {
    res = await client.messages.create(messageObject);
  } catch (e) {
    // 21612 Twilio error - is'nt reachable for short code
    if (e.code === 21612) {
      messageObject.from = process.env.INTERNATIONAL_PHONE;
      res = await client.messages.create(messageObject);
    } else {
      throw e;
    }
  }
  return res;
};

const getTwilioNumber = async (client, from) => {
  const phoneData = await client.lookups.phoneNumbers(from).fetch();
  const isUSPhone = phoneData.countryCode === 'US';
  return isUSPhone ? process.env.PHONE : process.env.INTERNATIONAL_PHONE;
};

sendUndeliveredMessage = async (message, client) => {
  try {
    const { from, to, text_message, media_url } = message;
    if (!from || !to || !text_message) {
      return;
    }
    const messageObject = {
      from,
      body: text_message,
      to,
      statusCallback: `${process.env.API_URL}/webhooks/twilio/status-callback/`,
      statusCallbackMethod: 'POST',
    };
    if (media_url) {
      messageObject.mediaUrl = media_url;
    }
    const response = await sendInternationalSms(client, messageObject);
    await Message.update(
      {
        twilio_sms_id: response.sid,
        attempts_left: message.attempts_left - 1,
      },
      {
        where: { id: message.id },
      }
    );
  } catch (e) {
    await Message.update(
      {
        attempts_left: message.attempts_left - 1,
      },
      {
        where: { id: message.id },
      }
    );
  }
};

const sendDailyText = async (user, guideDay, dayToAssign, guide, userGuide) => {
  try {
    if (dayToAssign === 0) {
      throw 'You can`t send day 0 guides';
    }

    const trackingParams = encodeURIComponent(
      `utm_source=daily texts&utm_medium=${guide.name} texts&utm_campaign=0 texts`
    );
    const messageText = personalizeTextMessage(user, guideDay.text_message);
    const imageQuoteUrl = `${process.env.BASE_URL}/img/quotes/${guide.old_guide_id}/${dayToAssign}.png`;
    const imageIsExisting = await imageExists(imageQuoteUrl);

    const smsAuthToken = await generateSmsAuthToken(user.id);

    const guideUrl =
      dayToAssign !== 22
        ? `${process.env.BASE_URL}/guides/${guide.url_safe_name}/day-${dayToAssign}/`
        : `${process.env.BASE_URL}/guides/`;
    const messageUrl = await shortener.createShort(
      `${process.env.BASE_URL}?redirect_url=${guideUrl}&uts=${smsAuthToken}&ui=${user.id}&${trackingParams}`,
      user.id
    );
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
        day: dayToAssign,
      });
      return message;
    } catch (e) {
      console.log(e);
      return null;
    }
  } catch (e) {
    console.log(e);
    return null;
  }
};

module.exports = {
  personalizeTextMessage,
  getTimezones,
  sendInternationalSms,
  getTwilioNumber,
  sendUndeliveredMessage,
  sendDailyText,
};
