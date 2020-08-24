const express = require('express');
const router = express.Router();
const onboardingController = require('../../../controllers/api/onboarding');
const { userIsAuth } = require('../../../controllers');

router.post('/pass_onboarding', userIsAuth, onboardingController.passOnboarding);

module.exports = router;
