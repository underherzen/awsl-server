const express = require('express');
const router = express.Router();
const ontraportController = require('../../../controllers/api/ontraport');
const { userIsAuth } = require('../../../controllers');

router.post('/visit-first-day-sms-link', userIsAuth, ontraportController.visitFirstDaySmsLink);

module.exports = router;
