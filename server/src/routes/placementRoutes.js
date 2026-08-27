const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    createPlacement,
    getActivePlacements,
    applyForPlacement,
    getAdminPlacements,
    getApplications,
    exportApplications,
    updatePlacementStatus,
    updatePlacement,
    deletePlacement,
    exportPlacements,
    bulkUploadPlacements
} = require('../controllers/placementController');

// Multer config for CSV upload
const storage = multer.diskStorage({
    destination: './src/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const uploadCSV = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname).toLowerCase() === '.csv') {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});

// Public routes
router.post('/', createPlacement);
router.get('/active', getActivePlacements);
router.post('/:id/apply', applyForPlacement);

// Admin routes (TODO: Add protection middleware when available)
router.get('/admin', getAdminPlacements);
router.get('/export', exportPlacements);
router.post('/bulk', uploadCSV.single('file'), bulkUploadPlacements);
router.get('/applications/export', exportApplications);
router.get('/applications', getApplications);
router.patch('/:id/status', updatePlacementStatus);
router.put('/:id', updatePlacement);
router.delete('/:id', deletePlacement);

module.exports = router;
