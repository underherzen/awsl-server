const express = require('express');
const router = express.Router();
const { userIsAuth } = require('../../../controllers');
const designController = require('../../../controllers/api/design');

router.use('/*', userIsAuth);

router.post('/choose_new', designController.chooseNewDesign);

router.post('/return_old', designController.returnOld);

router.post('/reject_suggestion', designController.rejectSuggestion);

module.exports = router;
