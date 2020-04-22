const express = require("express");
const router = express.Router();
const { isUserActive, userIsAuth } = require("../../../controllers");
const guideController = require("../../../controllers/api/guides");

// public methods

router.get("/load-guides", guideController.loadGuides);

// private methods

router.use("/*", userIsAuth);

router.post("/select-guide", guideController.selectGuide);

router.get("/guide-day", guideController.getGuideDay);

router.get("/guide-days-slider", guideController.getGuideDaysForSlider);

router.post("/reset-guide", guideController.resetGuide);

router.post("/accept-guide-day", guideController.acceptGuideDay);

router.post("/visit-guide-day", guideController.visitGuideDay);

module.exports = router;
