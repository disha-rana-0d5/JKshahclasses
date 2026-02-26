const Order = require('../models/Order');
const paginate = require('../utils/paginate');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res) => {
    try {
        const paginatedResults = await paginate(Order, req.query, {
            searchFields: ['status', 'paymentMethod'], // Search doesn't directly support ref fields easily with our current paginate util, we'll keep it simple
            populate: [
                { path: 'user', select: 'name email' },
                { path: 'course', select: 'title' }
            ],
            sort: { createdAt: -1 }
        });

        res.status(200).json({
            success: true,
            ...paginatedResults
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
exports.updateOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
