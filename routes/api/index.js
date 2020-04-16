const express = require('express');
const router = express.Router();
const guideRoutes = require('./guides');
const {User} = require('../../models');
const {retrieveToken} = require('../../modules/helpers');

router.use('/*', async (req, res, next) => {
  const token = await retrieveToken(req.headers);
  if (!token) {
    res.sendStatus(401);
    return;
  }
  const user = await User.findByPk(token.user_id);
  if (!user) {
    res.sendStatus(401);
    return;
  }
  req.user = user.dataValues;
  next()
});


//these routes if
router.use('/guides', guideRoutes);


module.exports = router;
