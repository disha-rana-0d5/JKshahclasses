const express = require('express');
const router = express.Router();
const careerController = require('../controllers/careerController');

// Public routes
router.get('/active', careerController.getActiveListings);
router.post('/apply', careerController.submitApplication);

// Admin routes (middleware would be applied in index/router)
router.get('/admin', careerController.getAdminListings);
router.post('/admin', careerController.addOrUpdateListing);
router.delete('/admin/:id', careerController.deleteListing);
router.get('/applications', careerController.getApplications);
router.get('/applications/export', careerController.exportApplications);

module.exports = router;
