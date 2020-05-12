const express = require('express');
const router = express.Router();
const guideRoutes = require('./guides');
const authRoutes = require('./auth');
const accountRoutes = require('./account/');
const shortUrlRoutes = require('./short_urls');
const couponRoutes = require('./coupons');
const designRoutes = require('./design');
const ontraportRoutes = require('./ontraport');
const adminRoutes = require('./admin');
const testRoutes = require('./test');

router.use('/guides', guideRoutes);

router.use('/auth', authRoutes);

router.use('/account', accountRoutes);

router.use('/short_urls', shortUrlRoutes);

router.use('/coupons', couponRoutes);

router.use('/design', designRoutes);

router.use('/ontraport', ontraportRoutes);

router.use('/admin', adminRoutes);

router.use('/test', testRoutes);

module.exports = router;
