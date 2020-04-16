const {UserGuide} = require('../../../models')


const selectGuide = async (req, res, next) => {
  const body = req.body;
  const user = req.user;
  if (user.guide_id) {
    res.status(400).send({error: 'You already have guide'})
  }

  res.sendStatus(400);
};

module.exports = {
  selectGuide
};
