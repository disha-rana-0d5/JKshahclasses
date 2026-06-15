const express = require('express');
const router = express.Router();
const {
    getAllAlumni,
    addAlumni,
    updateAlumni,
    deleteAlumni
} = require('../controllers/alumniController');

router.get('/', getAllAlumni);

// Admin only routes
router.post('/', addAlumni);
router.put('/:id', updateAlumni);
router.delete('/:id', deleteAlumni);

module.exports = router;
