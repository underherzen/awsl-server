const express = require('express');
const router = express.Router();
const ontraportController = require('../../../controllers/api/ontraport');

router.post('/visit-first-day-sms-link', ontraportController.visitFirstDaySmsLink);

module.exports = router;
