const express = require('express');
const router = express.Router();
const twilioController = require('../../../controllers/webhooks/twilio');

router.use('/status-callback', twilioController.twilioStatusCallback);

router.use('/reply', twilioController.replyWebhook);

module.exports = router;
