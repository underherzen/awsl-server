const express = require('express');
const router = express.Router();
const guidesController = require('../../../../controllers/api/admin/guides');

router.get('/get_guides', guidesController.loadGuides);

router.put('/update_guide/:id', guidesController.updateGuide);

module.exports = router;
