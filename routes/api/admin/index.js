const express = require('express');
const router = express.Router();
const usersController = require('../../../controllers/api/admin/users');
const guidesController = require('../../../controllers/api/admin/guides');
const { userIsAuth, userIsAdmin } = require('../../../controllers');

router.use('/*', userIsAuth, userIsAdmin);

router.get('/users', usersController.loadUsers);
router.get('/guides', guidesController.loadGuides);

module.exports = router;
