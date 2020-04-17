const express = require('express');
const router = express.Router();
const guideController = require('../../../controllers/api/guides');

router.post('/select-guide', guideController.selectGuide);

router.get('/guide-day', guideController.getGuideDay);

router.get('/guide-days-slider', guideController.getGuideDaysForSlider);


module.exports = router;
