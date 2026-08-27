const ERPBatchVisibility = require('../models/ERPBatchVisibility');

// @desc    Get all batch visibilities
// @route   GET /api/erp-batch-visibility
// @access  Public
exports.getBatchVisibilities = async (req, res) => {
    try {
        const visibilities = await ERPBatchVisibility.find();
        res.status(200).json({ success: true, data: visibilities });
    } catch (error) {
        console.error("Error fetching ERP batch visibilities:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create or update batch visibility
// @route   POST /api/erp-batch-visibility
// @access  Public
exports.saveBatchVisibility = async (req, res) => {
    try {
        const { erpBatchId, courseId, levelId, isVisible } = req.body;

        if (!erpBatchId) {
            return res.status(400).json({ success: false, message: 'Please provide erpBatchId' });
        }

        const visibilityData = {
            erpBatchId,
            courseId,
            levelId,
            isVisible: isVisible ?? true
        };

        const visibility = await ERPBatchVisibility.findOneAndUpdate(
            { erpBatchId },
            visibilityData,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: visibility });
    } catch (error) {
        console.error("Error saving ERP batch visibility:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
