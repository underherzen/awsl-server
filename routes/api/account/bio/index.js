const express = require('express');
const router = express.Router();
const bioController = require('../../../../controllers/api/account/bio');

router.post('/change-bio', bioController.changeBio);

router.post('/change-email', bioController.changeEmail);

module.exports = router;
