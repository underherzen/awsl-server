const express = require('express');
const router = express.Router();
const publicControllers = require('../../controllers/public');

router.get('/guides', publicControllers.loadGuides);

module.exports = router;
