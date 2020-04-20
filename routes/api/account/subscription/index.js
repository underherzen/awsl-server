const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../../controllers/api/account/subscription');
const {userHasSubscription} = require('../../../../controllers');

router.post('/pause-subscription', userHasSubscription, subscriptionController.pauseSubscription);

router.post('/reset-subscription', userHasSubscription, subscriptionController.resetSubscription);

router.post('/change-payment-method', userHasSubscription, subscriptionController.changePaymentMethod);




module.exports = router;
