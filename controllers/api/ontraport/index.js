const { updateOntraportSubscription, createOntraportSubscription } = require('../../../modules/ontraport');
const { Message } = require('../../../models');
const moment = require('moment');
const _ = require('lodash');

const visitFirstDaySmsLink = async (req, res, next) => {
  const { user } = req;
  try {
    const message = await Message.findOne({
      where: {
        user_id: user.id,
        day: 1,
      },
    });

    const fields = {
      f1963: true,
      f1962: moment(message.created_at).unix(),
    };
    await updateOntraportSubscription(user.ontraport_id, fields);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: 'Something sent wrong!' });
  }
};

const subscribeOntraport = async (req, res, next) => {
  const {
    user,
    ipInfo,
    body: { requisites },
  } = req;

  if (_.isUndefined(requisites)) {
    res.sendStatus(404).send({ error: 'Something sent wrong!' });
    return;
  }

  if (_.isUndefined(user)) {
    try {
      const subscription = {
        firstname: requisites.firstname,
        email: requisites.email,
        sms_number: requisites.phone,
        ip_addy_display: ipInfo.ip,
        country: ipInfo.country,
      };
      await createOntraportSubscription(subscription);
      res.send({ message: 'You’re in! Check your inbox :)' });
    } catch (error) {
      res.sendStatus(404).send({ error: 'Something sent wrong!' });
      return;
    }
  } else {
  }
};

module.exports = {
  visitFirstDaySmsLink,
};
