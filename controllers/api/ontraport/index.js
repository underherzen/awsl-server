const {
  createOntraportSubscription,
  updateOntraportSubscription,
  checkExistOntraportSubscriptionByEmail,
} = require('../../../modules/ontraport');
const { Message } = require('../../../models');
const moment = require('moment');
const _ = require('lodash');

const visitFirstDaySmsLink = async (req, res, next) => {
  try {
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
    } catch (e) {
      console.log(e);
      res.status(404).send({ error: 'Something sent wrong!' });
    }
  } catch (e) {
    next(e);
  }
};

const addInOntraport = async (req, res, next) => {
  try {
    const { body } = req;

    if (_.isUndefined(body)) {
      res.status(404).send({ error: 'Something sent wrong!' });
      return;
    }

    try {
      const response = await checkExistOntraportSubscriptionByEmail(body.email);

      const isExistSubscription = response.data.data.length !== 0;
      if (isExistSubscription) {
        //res.sendStatus(400).send({ error: 'Subscription is exist...' });
        res.status(409).send({ error: 'You are already in the waiting list.' });
        return;
      }
    } catch (e) {
      res.status(404).send({ error: 'Something sent wrong!' });
      return;
    }

    try {
      await createOntraportSubscription(body);
      res.send({ message: 'You’re in! Check your inbox :)' });
    } catch (e) {
      res.status(404).send({ error: 'Something sent wrong!' });
    }
  } catch (e) {
    next(e);
  }
};

module.exports = {
  visitFirstDaySmsLink,
  addInOntraport,
};
