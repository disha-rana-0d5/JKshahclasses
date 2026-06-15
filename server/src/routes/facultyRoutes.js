const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
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

router.get('/export', facultyController.exportFaculties);
router.get('/', facultyController.getFaculties);
router.post('/', facultyController.addFaculty);
router.post('/bulk', uploadCSV.single('file'), facultyController.bulkUploadFaculties);
router.put('/:id', facultyController.updateFaculty);
router.delete('/:id', facultyController.deleteFaculty);
router.delete('/', facultyController.deleteAllFaculties);

module.exports = router;
