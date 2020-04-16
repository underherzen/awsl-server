const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth');



router.post('/login', authController.login);

router.post('/sign_up', authController.signUp);

router.get('/whoami', authController.whoami);

router.get('/user-lookup', authController.userLookup);





module.exports = router;
