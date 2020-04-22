const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../../controllers/api/account/subscription');
const {
  retrieveAndUpdateUserSubscription,
} = require('../../../../controllers');

router.post(
  '/pause-subscription',
  retrieveAndUpdateUserSubscription,
  subscriptionController.pauseSubscription
);

router.post(
  '/reset-subscription',
  retrieveAndUpdateUserSubscription,
  subscriptionController.resetSubscription
);

router.post(
  '/change-payment-method',
  retrieveAndUpdateUserSubscription,
  subscriptionController.changePaymentMethod
);

module.exports = router;
