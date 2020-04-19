const express = require('express');
const router = express.Router();
const {isUserActive, userIsAuth} = require('../../../controllers');
const guideController = require('../../../controllers/api/guides');

// public methods

router.get('/load-guides', guideController.loadGuides);


// private methods

router.use('/*', userIsAuth);

router.post('/select-guide', guideController.selectGuide);

router.get('/guide-day', guideController.getGuideDay);

router.get('/guide-days-slider', guideController.getGuideDaysForSlider);


module.exports = router;
