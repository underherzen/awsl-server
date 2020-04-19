const express = require('express');
const router = express.Router();
const subscriptionController = require('../../../../controllers/api/account/subscription');

router.post('/pause-subscription', subscriptionController.pauseSubscription);




module.exports = router;
