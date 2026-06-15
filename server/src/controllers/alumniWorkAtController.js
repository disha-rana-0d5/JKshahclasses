const AlumniWorkAt = require('../models/AlumniWorkAt');
const paginate = require('../utils/paginate');

exports.getAll = async (req, res) => {
    try {
        const { category, subCategory, course } = req.query;

        const baseQuery = {};
        if (category) baseQuery.category = category;
        if (subCategory) baseQuery.subCategory = subCategory;
        if (course) baseQuery.course = course;

        const options = {
            searchFields: ['companyName', 'category', 'subCategory'],
            sort: 'order createdAt',
            baseQuery
        };

        const result = await paginate(AlumniWorkAt, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.add = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === '') req.body.image = '/uploads/placeholder.png';
        const item = await AlumniWorkAt.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === '') req.body.image = '/uploads/placeholder.png';
        const item = await AlumniWorkAt.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!item) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const item = await AlumniWorkAt.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ success: false, message: 'Entry not found' });
        res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
