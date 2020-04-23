const express = require('express');
const router = express.Router();
const { userIsAuth } = require('../../../controllers');
const designController = require('../../../controllers/api/design');

router.use('/*', userIsAuth);

router.post('/choose-new', designController.chooseNewDesign);

router.post('/reject-new', designController.rejectNewDesign);



module.exports = router;
