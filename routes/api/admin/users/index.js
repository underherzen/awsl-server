const express = require('express');
const router = express.Router();
const usersController = require('../../../../controllers/api/admin/users');

router.get('/get_users', usersController.loadUsers);

router.put('/update_user/:id', usersController.updateUser);

module.exports = router;
