const Level = require('../models/Level');
const paginate = require('../utils/paginate');

// @desc    Get all levels
// @route   GET /api/levels
// @access  Public
exports.getLevels = async (req, res, next) => {
    try {
        const result = await paginate(Level, req.query, {
            searchFields: ['name'],
            sort: 'name'
        });
        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create new level
// @route   POST /api/levels
// @access  Private/Admin
exports.addLevel = async (req, res, next) => {
    try {
        const level = await Level.create(req.body);
        res.status(201).json({
            success: true,
            data: level
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Level already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete level
// @route   DELETE /api/levels/:id
// @access  Private/Admin
exports.deleteLevel = async (req, res, next) => {
    try {
        const level = await Level.findByIdAndDelete(req.params.id);

        if (!level) {
            return res.status(404).json({ success: false, message: 'Level not found' });
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
