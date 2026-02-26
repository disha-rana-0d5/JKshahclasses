const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'student' });
        const totalCourses = await Course.countDocuments();
        const totalOrders = await Order.countDocuments();

        const revenueResult = await Order.aggregate([
            { $match: { status: 'Completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        const latestRegistrations = await User.find({ role: 'student' })
            .select('name email createdAt')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalCourses,
                totalOrders,
                totalRevenue,
                latestRegistrations
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
