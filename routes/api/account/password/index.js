const express = require('express');
const router = express.Router();
const passwordController = require('../../../../controllers/api/account/password');
const { userIsAuth } = require('../../../../controllers');

router.get('/reset_password', passwordController.sendResetPasswordEmail);

router.post('/reset_password', passwordController.resetPassword);

router.post('/change_password', userIsAuth, passwordController.changePassword);

module.exports = router;
