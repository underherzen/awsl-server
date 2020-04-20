const express = require('express');
const router = express.Router();
const passwordRoutes = require('./password');
const subscriptionRoutes = require('./subscription');
const bioRoutes = require('./bio');
const {userIsAuth, userHasSubscription} = require('../../../controllers');

router.use('/password', passwordRoutes);

router.use('/subscription', userIsAuth, subscriptionRoutes);

router.use('/bio', userIsAuth, userHasSubscription, bioRoutes);

module.exports = router;
