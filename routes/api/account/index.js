const express = require('express');
const router = express.Router();
const passwordRoutes = require('./password');
const subscriptionRoutes = require('./subscription');
const {userIsAuth} = require('../../../controllers');

router.use('/password', passwordRoutes);

router.use('/subscription', userIsAuth, subscriptionRoutes);

module.exports = router;
