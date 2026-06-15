const ERPCourseMapping = require('../models/ERPCourseMapping');

// @desc    Get all mappings
// @route   GET /api/erp-course-mappings
// @access  Public
exports.getMappings = async (req, res) => {
    try {
        const mappings = await ERPCourseMapping.find();
        res.status(200).json({ success: true, data: mappings });
    } catch (error) {
        console.error("Error fetching ERP course mappings:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create or update mapping
// @route   POST /api/erp-course-mappings
// @access  Public
exports.saveMapping = async (req, res) => {
    try {
        const { erpCourseId, courseName, category, subCategory, isVisible } = req.body;

        if (!erpCourseId || !category || !subCategory) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const mappingData = {
            erpCourseId,
            courseName,
            category,
            subCategory,
            isVisible: isVisible ?? false
        };

        const mapping = await ERPCourseMapping.findOneAndUpdate(
            { erpCourseId },
            mappingData,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: mapping });
    } catch (error) {
        console.error("Error saving ERP course mapping:", error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
