const { updateOntraportSubscription } = require('../../../modules/ontraport');

const visitFirstDaySmsLink = async (req, res, next) => {
  const { user } = req;
  try {
    const fields = {
      f1963: true,
    };
    await updateOntraportSubscription(fields, user.ontraport_id);
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(404).send({ error: 'Something sent wrong!' });
  }
};

module.exports = {
  visitFirstDaySmsLink,
};
