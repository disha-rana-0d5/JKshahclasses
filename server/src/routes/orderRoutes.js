const express = require('express');
const router = express.Router();
const { getOrders, updateOrder } = require('../controllers/orderController');
// const { protect, admin } = require('../middleware/authMiddleware'); // Assuming we have these

router.route('/')
    .get(getOrders);

router.route('/:id')
    .put(updateOrder);

module.exports = router;
