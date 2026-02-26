const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');


router.post('/', uploadController.uploadImage);
router.post('/file', uploadController.uploadFile);
router.get('/', uploadController.getAllMedia);
router.delete('/:id', uploadController.deleteMedia);


module.exports = router;
