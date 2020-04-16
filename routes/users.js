const express = require('express');
const router = express.Router();
const { User } = require('../models');

/* GET users listing. */
router.get('/:id', async function(req, res, next) {
  const id = req.params.id;
  const user = await User.findOne({where: { id }})
  console.log(user)
  res.send(user);
});



module.exports = router;
