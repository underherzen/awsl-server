const { updateOntraportSubscription } = require('../../../modules/ontraport');
const { Message } = require('../../../models');
const moment = require('moment');

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

module.exports = {
  visitFirstDaySmsLink,
};
