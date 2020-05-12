const express = require('express');
const router = express.Router();
const usersRoutes = require('./users');
const guidesRoutes = require('./guides');
const { userIsAuth, userIsAdmin } = require('../../../controllers');

router.use('/*', userIsAuth, userIsAdmin);

router.use('/users', usersRoutes);
router.use('/guides', guidesRoutes);

module.exports = router;
