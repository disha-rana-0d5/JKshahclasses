const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (decoded.id === '000000000000000000000000') {
                req.user = { _id: '000000000000000000000000', role: 'timetable_manager', name: 'Timetable Manager', email: 'timetablemanager@gmail.com' };
            } else {
                // Get user from the token
                req.user = await User.findById(decoded.id).select('-password');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const timetableManager = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'timetable_manager')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized for this action' });
    }
};

module.exports = { protect, admin, timetableManager };
