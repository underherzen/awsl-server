const express = require('express');
const router = express.Router();
const stripeController = require('../../../controllers/webhooks/stripe');

router.use('/subscriptions/update', stripeController.subscriptionUpdateWebhook);

router.use('/customers/update', stripeController.customerUpdateWebhook);



// router.use('/*', stripeController.getWebhook);

module.exports = router;
