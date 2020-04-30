const express = require('express');
const router = express.Router();
const testController = require('../../../controllers/api/test');

router.use('/test_connection', testController.testConnection);

module.exports = router;
