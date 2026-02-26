const express = require('express');
const router = express.Router();
const { getBatches, createBatch, deleteBatch, updateBatch } = require('../controllers/batchController');

router.route('/')
    .get(getBatches)
    .post(createBatch);

router.route('/:id')
    .put(updateBatch)
    .delete(deleteBatch);

module.exports = router;
