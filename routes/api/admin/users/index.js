const express = require('express');
const router = express.Router();
const usersController = require('../../../../controllers/api/admin/users');

router.get('/', usersController.loadUsers);

router.put('/update_user/:id', usersController.updateUser);

module.exports = router;
