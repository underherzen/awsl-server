const express = require('express');
const router = express.Router();
const guideRoutes = require('./guides');
const authRoutes = require('./auth');
const {User} = require('../../models');
const {isUserActive, userIsAuth} = require('../../controllers');
const {retrieveToken} = require('../../modules/helpers');

router.use('/guides', guideRoutes);

router.use('/auth', authRoutes);

module.exports = router;
