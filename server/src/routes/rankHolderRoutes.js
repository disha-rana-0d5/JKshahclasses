const express = require('express');
const router = express.Router();
const rankHolderController = require('../controllers/rankHolderController');
const multer = require('multer');
const path = require('path');

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

router.get('/export', rankHolderController.exportRankHolders);
router.get('/', rankHolderController.getAllRankHolders);
router.post('/', rankHolderController.addRankHolder);
router.post('/bulk', uploadCSV.single('file'), rankHolderController.bulkUploadRankHolders);
router.put('/:id', rankHolderController.updateRankHolder);
router.delete('/:id', rankHolderController.deleteRankHolder);

module.exports = router;
