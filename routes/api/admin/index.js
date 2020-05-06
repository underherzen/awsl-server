const express = require('express');
const router = express.Router();
const usersController = require('../../../controllers/api/admin/users');
const { userIsAuth, userIsAdmin } = require('../../../controllers');

router.use('/*', userIsAuth, userIsAdmin);

router.get('/users', usersController.loadUsers);

module.exports = router;
