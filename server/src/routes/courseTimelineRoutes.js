const express = require('express');
const router = express.Router();
const courseTimelineController = require('../controllers/courseTimelineController');

router.get('/', courseTimelineController.getAllTimelines);
router.post('/', courseTimelineController.addOrUpdateTimeline);
router.delete('/:id', courseTimelineController.deleteTimeline);

module.exports = router;
