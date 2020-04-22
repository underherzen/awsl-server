const express = require('express');
const router = express.Router();
const couponController = require('../../../controllers/api/coupons');

router.get('/retrieve', couponController.retrieveCoupon);

module.exports = router;
