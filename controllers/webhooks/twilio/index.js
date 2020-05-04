const { Message, User } = require('../../../models');
const { REPLY_TEXTS, REPLY_COMMANDS, MESSAGES_TYPES, MESSAGES_STATUSES } = require('../../../constants');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const { parseUrlEncode, generateSmsAuthToken } = require('../../../modules/helpers');
const { getTwilioNumber } = require('../../../modules/twilio');
const urlShortener = require('../../../modules/urlShortener');
const shortener = new urlShortener();
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const twilioStatusCallback = async (req, res, next) => {
  try {
    const body = req.body;
    const twilioSmsSid = body.SmsSid;
    const status = body.SmsStatus;
    console.log(status);

    const message = await Message.findOne({
      where: { twilio_sms_id: twilioSmsSid },
    });
    if (!message) {
      res.sendStatus(404);
      return;
    }
    await Message.update({ status }, { where: { id: message.id } });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

const replyWebhook = async (req, res, next) => {
  try {
    const twiml = new MessagingResponse();
    const message = twiml.message();
    console.log(req.body);

    const body = req.body;
    let sentCommand = body.Body.trim().toUpperCase();
    if (sentCommand.indexOf(' ') > -1) {
      sentCommand = sentCommand.split(' ')[0];
    }
    let messageBody;

    const authCommands = [REPLY_COMMANDS.YES, REPLY_COMMANDS.HELP, REPLY_COMMANDS.STOP, REPLY_COMMANDS.UNSTOP];
    if (authCommands.includes(sentCommand)) {
      const facebookUrl = 'https://www.facebook.com/groups/goliveitup/';
      const user = await User.findOne({
        where: { phone: body.From },
      });
      if (!user) {
        res.sendStatus(404);
        return;
      }

      const isSentFromInternational = (await getTwilioNumber(client, user.phone)) === process.env.INTERNATIONAL_PHONE;

      if (sentCommand === REPLY_COMMANDS.YES) {
        if (isSentFromInternational) {
          message.media(`${process.env.BASE_URL}/docs/contact-card-international.vcf`);
        } else {
          message.media(`${process.env.BASE_URL}/docs/contact-card.vcf`);
        }
        messageBody = REPLY_TEXTS.YES.replace('{1}', facebookUrl);
        await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.REPLY_YES,
          status: MESSAGES_STATUSES.SENT,
        });
      } else if (sentCommand === REPLY_COMMANDS.STOP) {
        await User.update(
          {
            can_receive_texts: false,
          },
          {
            where: { id: user.id },
          }
        );
        messageBody = REPLY_TEXTS.STOP.replace('{0}', user.first_name);
        await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.REPLY_STOP,
          status: MESSAGES_STATUSES.SENT,
        });
      } else if (sentCommand === REPLY_COMMANDS.UNSTOP) {
        await User.update(
          {
            can_receive_texts: true,
          },
          {
            where: { id: user.id },
          }
        );
        const guideUrl = `${process.env.BASE_URL}/guides/`;
        const smsAuthToken = await generateSmsAuthToken(user.id);
        const shortUrl = await shortener.createShort(
          `${process.env.BASE_URL}?redirect_url=${guideUrl}&uts=${smsAuthToken}&ui=${user.id}`,
          user.id
        );
        messageBody = REPLY_TEXTS.UNSTOP.replace('{0}', shortUrl);
        await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.REPLY_UNSTOP,
          status: MESSAGES_STATUSES.SENT,
        });
      } else if (sentCommand === REPLY_COMMANDS.HELP) {
        messageBody = REPLY_TEXTS.HELP.replace('{0}', user.first_name);
        await Message.create({
          user_id: user.id,
          type: MESSAGES_TYPES.REPLY_HELP,
          status: MESSAGES_STATUSES.SENT,
        });
      }
      message.body(messageBody);
      res.writeHead(200, { 'Content-type': 'text/vcard', 'Content-Disposition': 'inline' });
      res.end(twiml.toString());
      return;
    } else if (sentCommand === REPLY_COMMANDS.COMMUNITY) {
      messageBody = REPLY_TEXTS.COMMUNITY;
      message.body(messageBody);
      res.send(twiml.toString());
      return;
    }
    res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  twilioStatusCallback,
  replyWebhook,
};
