const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../../controllers/api/account/subscription');
const { retrieveAndUpdateUserSubscription } = require('../../../../controllers');

router.post('/pause-subscription', subscriptionController.pauseSubscription);

router.post('/reset-subscription', subscriptionController.resetSubscription);

router.post('/change-payment-method', subscriptionController.changePaymentMethod);

router.post('/remind_about_subscription_end', subscriptionController.remindAboutSubscriptionEnd);

router.post('/change_to_discount_plan', subscriptionController.changeToDiscountPlan);

router.post('/apply_coupon', subscriptionController.applyCouponToSubscription);

module.exports = router;
