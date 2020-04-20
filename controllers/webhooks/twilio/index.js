const {Message} = require('../../../models')

const twilioStatusCallback = async (req, res, next) => {
  const body = req.body;
  console.log(body);
  const twilioSmsSid = body.SmsSid;
  const status = body.status;

  const message = await Message.findOne({where: {twilio_sms_id: twilioSmsSid}});
  if (!message) {
    res.sendStatus(404);
    return;
  }
  await Message.update({status}, {where: {id: message.id}});
  res.sendStatus(200)
};

module.exports = {
  twilioStatusCallback
};
