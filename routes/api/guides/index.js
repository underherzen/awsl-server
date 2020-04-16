const express = require('express');
const router = express.Router();
const guideController = require('../../../controllers/api/guides');

router.post('/select-guide', guideController.selectGuide);


module.exports = router;
