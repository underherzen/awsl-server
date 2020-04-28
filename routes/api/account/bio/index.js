const express = require('express');
const router = express.Router();
const bioController = require('../../../../controllers/api/account/bio');

router.post('/change_bio', bioController.changeBio);

router.post('/change_email', bioController.changeEmail);

module.exports = router;
