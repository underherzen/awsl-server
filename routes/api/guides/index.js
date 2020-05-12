const express = require('express');
const router = express.Router();
const { userIsAuth } = require('../../../controllers');
const guideController = require('../../../controllers/api/guides');

// public methods

router.get('/load_guides', guideController.loadGuides);

// private methods

router.use('/*', userIsAuth);

router.post('/select_guide', guideController.selectGuide);

router.get('/guide_day', guideController.getGuideDay);

router.get('/guide_days_slider', guideController.getGuideDaysForSlider);

router.post('/reset_guide', guideController.resetGuide);

router.post('/accept_guide_day', guideController.acceptGuideDay);

router.post('/visit_guide_day', guideController.visitGuideDay);

router.post('/select_previous', guideController.selectPrevious);

module.exports = router;
