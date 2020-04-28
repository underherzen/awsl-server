const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../../controllers/api/account/subscription');
const { retrieveAndUpdateUserSubscription } = require('../../../../controllers');

router.post('/pause_subscription', subscriptionController.pauseSubscription);

router.post('/reset_subscription', subscriptionController.resetSubscription);

router.post('/change_payment_method', subscriptionController.changePaymentMethod);

router.post('/remind_about_subscription_end', subscriptionController.remindAboutSubscriptionEnd);

router.post('/change_to_discount_plan', subscriptionController.changeToDiscountPlan);

router.post('/apply_coupon', subscriptionController.applyCouponToSubscription);

module.exports = router;
