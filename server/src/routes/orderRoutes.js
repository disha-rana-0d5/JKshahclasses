const express = require('express');
const router = express.Router();
const { getOrders, updateOrder, createOrder, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(getOrders)
    .post(createOrder);

router.get('/myorders', protect, getMyOrders);

router.route('/:id')
    .put(updateOrder);

module.exports = router;
