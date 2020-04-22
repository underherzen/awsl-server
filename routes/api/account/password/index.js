const express = require('express');
const router = express.Router();
const passwordController = require('../../../../controllers/api/account/password');
const { userIsAuth } = require('../../../../controllers');

router.get('/reset-password', passwordController.sendResetPasswordEmail);

router.post('/reset-password', passwordController.resetPassword);

router.post('/change-password', userIsAuth, passwordController.changePassword);

module.exports = router;
