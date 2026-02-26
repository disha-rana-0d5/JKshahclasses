const Batch = require('../models/Batch');

const paginate = require('../utils/paginate');

// @desc    Get all batches
// @route   GET /api/batches
// @access  Public
exports.getBatches = async (req, res) => {
    try {
        const options = {
            searchFields: ['location', 'categories', 'level', 'mode', 'dayTiming'],
            sort: '-createdAt'
        };

        const result = await paginate(Batch, req.query, options);

        // On-the-fly migration for legacy data
        if (result.success && result.data) {
            result.data = result.data.map(batch => {
                const b = batch.toObject();
                if (!b.categories && b.category) {
                    b.categories = [b.category];
                }
                return b;
            });
        }

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Create new batch
// @route   POST /api/batches
// @access  Private/Admin
exports.createBatch = async (req, res) => {
    try {
        const batch = await Batch.create(req.body);
        res.status(201).json({
            success: true,
            data: batch
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
// @access  Private/Admin
exports.updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found'
            });
        }

        res.status(200).json({
            success: true,
            data: batch
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                error: messages
            });
        }
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
// @access  Private/Admin
exports.deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);

        if (!batch) {
            return res.status(404).json({
                success: false,
                error: 'Batch not found'
            });
        }

        await batch.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};
