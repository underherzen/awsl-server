const express = require('express');
const router = express.Router();
const stripeRoutes = require('./stripe');
const twilioRoutes = require('./twilio');

router.use('/stripe', stripeRoutes);

router.use('/twilio', twilioRoutes);

module.exports = router;
