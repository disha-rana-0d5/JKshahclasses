const CourseTimeline = require('../models/CourseTimeline');
const paginate = require('../utils/paginate');

exports.getAllTimelines = async (req, res) => {
    try {
        const result = await paginate(CourseTimeline, req.query, {
            searchFields: ['subCategory'],
            sort: '-createdAt'
        });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.addOrUpdateTimeline = async (req, res) => {
    try {
        const { subCategory, image } = req.body;
        const timeline = await CourseTimeline.findOneAndUpdate(
            { subCategory },
            { image },
            { upsert: true, new: true, runValidators: true }
        );
        res.status(200).json({
            success: true,
            data: timeline
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteTimeline = async (req, res) => {
    try {
        const timeline = await CourseTimeline.findByIdAndDelete(req.params.id);
        if (!timeline) {
            return res.status(404).json({
                success: false,
                message: 'Timeline not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Timeline deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
