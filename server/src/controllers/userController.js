const User = require('../models/User');
const paginate = require('../utils/paginate');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        const options = {
            searchFields: ['name', 'email'],
            populate: { path: 'enrolledCourses.courseId', select: 'title' },
            sort: '-createdAt'
        };

        const result = await paginate(User, req.query, options);
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        console.log('Update User Request Body:', req.body);
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.status = req.body.status || user.status;

            if (req.body.password) {
                console.log('Updating password for user:', user._id);
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
