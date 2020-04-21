const express = require('express');
const router = express.Router();
const shortUrlController = require('../../../controllers/api/short_urls');

router.post('/get_full_url', shortUrlController.getFullUrl);

module.exports = router;
