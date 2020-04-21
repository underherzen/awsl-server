const {Message} = require('../../models');

const personalizeTextMessage = (user, textMessage) => {
  user.firstName = user.first_name;
  return Object.keys(user).reduce((string, propertyName) => {
    // This normalizes the property names and makes the regex a lot more relaxed.
    // For example, with this, all of the following work: @[firstname], @[first Name], @[FiRsT   nAmE], etc
    const textPropertyName = propertyName.replace(/([a-z])([A-Z])/g, '$1\\s*$2');
    return string.replace(new RegExp(`@\\[${textPropertyName}]`, 'ig'), user[propertyName]);
  }, textMessage)
};

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

const sendInternationalSms = async (client, messageObject) => {
  let res;
  try {
    res = await client.messages.create(messageObject);
  } catch (e) {
    // 21612 Twilio error - is'nt reachable for short code
    if (e.code === 21612) {
      messageObject.from = process.env.INTERNATIONAL_PHONE;
      res = await client.messages.create(messageObject);
    } else {
      throw e
    }
  }
  return res;
};

const getTwilioNumber = async (client, from) => {
  const phoneData = await client.lookups.phoneNumbers(from).fetch();
  const isUSPhone = phoneData.countryCode === "US";
  return isUSPhone ? process.env.PHONE : process.env.INTERNATIONAL_PHONE
};

sendUndeliveredMessage = async (message, client) =>  {
  try {
    const {from, to, message_text, media_url} = message;
    if (!from || !to || !message_text) {
      return;
    }
    const messageObject = {
      from,
      body: message_text,
      to,
      statusCallback: `${process.env.API_URL}/webhooks/twilio/status-callback/`,
      statusCallbackMethod: 'POST'
    };
    if (media_url) {
      messageObject.mediaUrl = media_url;
    }
    const response = await sendInternationalSms(client, messageObject);
    await Message.update({
      twilio_sms_id: response.sid,
      attempts_left: message.attempts_left - 1
    }, {
      where: {id: message.id}
    })
  } catch (e) {
    await Message.update({
      attempts_left: message.attempts_left - 1
    }, {
      where: {id: message.id}
    })
  }
};

module.exports = {
  personalizeTextMessage,
  getTimezones,
  sendInternationalSms,
  getTwilioNumber,
  sendUndeliveredMessage
};
