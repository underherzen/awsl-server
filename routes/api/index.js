const express = require('express');
const router = express.Router();
const guideRoutes = require('./guides');
const {User} = require('../../models');
const {isUserActive} = require('../../controllers');
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

//routes if it doesnt matter if active or not

router.use('/guides', guideRoutes);

//these routes if user is active
router.use('/*', isUserActive);




module.exports = router;
