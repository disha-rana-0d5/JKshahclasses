const express = require('express');
const {
    getMappings,
    saveMapping
} = require('../controllers/erpCourseMappingController');

const router = express.Router();

router.route('/')
    .get(getMappings)
    .post(saveMapping);

module.exports = router;
