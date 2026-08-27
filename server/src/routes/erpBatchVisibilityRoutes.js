const express = require('express');
const router = express.Router();
const { getBatchVisibilities, saveBatchVisibility } = require('../controllers/erpBatchVisibilityController');
// const { protect, authorize } = require('../middleware/auth'); // Add auth middleware if needed

router
    .route('/')
    .get(getBatchVisibilities)
    .post(saveBatchVisibility);

module.exports = router;
