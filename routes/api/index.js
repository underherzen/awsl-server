const express = require('express');
const router = express.Router();
const guideRoutes = require('./guides');
const authRoutes = require('./auth');
const accountRoutes = require('./account/');
const shortUrlRoutes = require('./short_urls');

router.use('/guides', guideRoutes);

router.use('/auth', authRoutes);

router.use('/account', accountRoutes);

router.use('/short_urls', shortUrlRoutes);

module.exports = router;
