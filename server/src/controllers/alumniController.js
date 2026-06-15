const Alumni = require('../models/Alumni');
const paginate = require('../utils/paginate');

exports.getAllAlumni = async (req, res) => {
    try {
        const options = {
            searchFields: ['name', 'designation'],
            sort: 'order createdAt'
        };

        const result = await paginate(Alumni, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.addAlumni = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';

        // If this alumni is featured, unfeature all others
        if (req.body.isFeatured === true) {
            await Alumni.updateMany({}, { isFeatured: false });
        }

        const alumni = await Alumni.create(req.body);
        res.status(201).json({
            success: true,
            data: alumni
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateAlumni = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';

        // If this alumni is being set to featured, unfeature all others
        if (req.body.isFeatured === true) {
            await Alumni.updateMany({ _id: { $ne: req.params.id } }, { isFeatured: false });
        }

        const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: 'Alumni not found'
            });
        }
        res.status(200).json({
            success: true,
            data: alumni
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.findByIdAndDelete(req.params.id);
        if (!alumni) {
            return res.status(404).json({
                success: false,
                message: 'Alumni not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Alumni deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
