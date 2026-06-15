const express = require('express');
const router = express.Router();
const { getLandingContent, updateLandingContent, exportBranches, bulkUploadBranches, deleteAllBranches } = require('../controllers/landingPageController');
const multer = require('multer');
const path = require('path');

// Multer config for CSV upload
const storage = multer.diskStorage({
    destination: './src/uploads/',
    filename: function (req, file, cb) {
        cb(null, 'branches-' + Date.now() + path.extname(file.originalname));
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

// All routes here are under /api/content
router.route('/landing')
    .get(getLandingContent)
    .put(updateLandingContent);

router.get('/branches/export', exportBranches);
router.post('/branches/bulk', uploadCSV.single('file'), bulkUploadBranches);
router.delete('/branches', deleteAllBranches);

module.exports = router;

