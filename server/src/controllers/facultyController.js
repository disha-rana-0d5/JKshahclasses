const Faculty = require('../models/Faculty');
const paginate = require('../utils/paginate');

exports.getFaculties = async (req, res) => {
    try {
        const options = {
            searchFields: ['name', 'designation', 'expertise', 'specialization'],
            sort: '-createdAt'
        };

        const result = await paginate(Faculty, req.query, options);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.addFaculty = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        const faculty = new Faculty(req.body);
        const newFaculty = await faculty.save();
        res.status(201).json({
            success: true,
            data: newFaculty
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.updateFaculty = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        const updatedFaculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json({
            success: true,
            data: updatedFaculty
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        await Faculty.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Faculty deleted'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
