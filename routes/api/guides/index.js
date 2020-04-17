const express = require('express');
const router = express.Router();
const guideController = require('../../../controllers/api/guides');

router.post('/select-guide', guideController.selectGuide);

router.get('/guide-day', guideController.getGuideDay);


module.exports = router;
