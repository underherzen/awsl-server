const express = require('express');
const router = express.Router();
const passwordRoutes = require('./password');

router.use('/password', passwordRoutes);

module.exports = router;
