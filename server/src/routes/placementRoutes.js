const express = require('express');
const router = express.Router();
const {
    createPlacement,
    getActivePlacements,
    applyForPlacement,
    getAdminPlacements,
    getApplications,
    exportApplications,
    updatePlacementStatus,
    updatePlacement,
    deletePlacement
} = require('../controllers/placementController');

// Public routes
router.post('/', createPlacement);
router.get('/active', getActivePlacements);
router.post('/:id/apply', applyForPlacement);

// Admin routes (TODO: Add protection middleware when available)
router.get('/admin', getAdminPlacements);
router.get('/applications/export', exportApplications);
router.get('/applications', getApplications);
router.patch('/:id/status', updatePlacementStatus);
router.put('/:id', updatePlacement);
router.delete('/:id', deletePlacement);

module.exports = router;
