const CareerOpportunity = require('../models/CareerOpportunity');
const paginate = require('../utils/paginate');

exports.getAllCareerOpportunities = async (req, res) => {
    try {
        const result = await paginate(CareerOpportunity, req.query, {
            searchFields: ['subCategory', 'opportunities'],
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

exports.addOrUpdateCareerOpportunity = async (req, res) => {
    try {
        const { subCategory, image, opportunities } = req.body;

        const updateData = { opportunities };
        if (image !== undefined) {
            updateData.image = image === "" ? '/uploads/placeholder.png' : image;
        }

        const careerOpportunity = await CareerOpportunity.findOneAndUpdate(
            { subCategory },
            updateData,
            { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({
            success: true,
            data: careerOpportunity
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteCareerOpportunity = async (req, res) => {
    try {
        const careerOpportunity = await CareerOpportunity.findByIdAndDelete(req.params.id);
        if (!careerOpportunity) {
            return res.status(404).json({
                success: false,
                message: 'Career opportunity config not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Career opportunity config deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
