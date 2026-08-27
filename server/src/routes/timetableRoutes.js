const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { protect, timetableManager } = require('../middleware/authMiddleware');

router.get('/', timetableController.getTimetables);
router.get('/:id', timetableController.getTimetableById);

// Protect all other routes
router.use(protect, timetableManager);

router.post('/bulk', timetableController.bulkCreateTimetables);
router.post('/', timetableController.createTimetable);
router.put('/:id', timetableController.updateTimetable);
router.delete('/:id', timetableController.deleteTimetable);

module.exports = router;
