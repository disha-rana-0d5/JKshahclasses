const express = require('express');
const router = express.Router();
const { getLandingContent, updateLandingContent } = require('../controllers/landingPageController');

// All routes here are under /api/content/landing
router.route('/landing')
    .get(getLandingContent)
    .put(updateLandingContent);

module.exports = router;
