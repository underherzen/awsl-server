const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { getTwilioNumber, sendInternationalSms } = require('../../twilio');
const { User, Message } = require('../../../models');
const { MESSAGES_TYPES } = require('../../../constants');

const sendWelcomeMessage = async (user) => {
  try {
    const messageText = `Hi ${user.first_name}! Welcome to LiveItUp! Text YES to officially join LiveItUp’s messages.\n\nLet’s get this out of the way—Msg&data rates may apply. 1 msg/day. Reply HELP for help, and STOP if you need a breather. (step 1 of 2)`;
    const messageObject = {
      from: await getTwilioNumber(client, user.phone),
      body: messageText,
      to: user.phone,
      statusCallback: `${process.env.API_URL}/webhooks/twilio/status-callback/`,
    };
    const response = await sendInternationalSms(client, messageObject);
    const message = await Message.create({
      user_id: user.id,
      from: messageObject.from,
      to: messageObject.to,
      text_message: messageObject.body,
      type: MESSAGES_TYPES.WELCOME,
      twilio_sms_id: response.sid,
      status: response.status,
    });
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  sendWelcomeMessage,
};
