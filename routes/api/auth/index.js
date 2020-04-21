const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/api/auth');



router.post('/login', authController.login);

router.post('/sign_up', authController.signUp);

router.get('/whoami', authController.whoami);

router.get('/user-lookup', authController.userLookup);

router.post('/auth-by-sms', authController.authBySmsToken);



module.exports = router;
