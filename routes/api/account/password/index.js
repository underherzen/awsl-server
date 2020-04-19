const express = require('express');
const router = express.Router();
const accountController = require('../../../../controllers/api/account/password');

router.get('/reset-password', accountController.sendResetPasswordEmail);

router.post('/reset-password', accountController.resetPassword);

module.exports = router;
