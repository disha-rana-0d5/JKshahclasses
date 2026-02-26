const Category = require('../models/Category');
const paginate = require('../utils/paginate');
const Course = require('../models/Course');
const CourseTimeline = require('../models/CourseTimeline');
const CareerOpportunity = require('../models/CareerOpportunity');
const RankHolder = require('../models/RankHolder');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res) => {
    try {
        const paginatedResults = await paginate(Category, req.query, {
            searchFields: ['name', 'slug'],
            sort: { sequence: 1, createdAt: -1 }
        });

        res.status(200).json({
            success: true,
            ...paginatedResults
        });
    } catch (error) {
        console.error('Error in getCategories:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Add a category
// @route   POST /api/categories
// @access  Private (Admin)
exports.addCategory = async (req, res) => {
    try {
        const {
            name, description, parent, slug, metaTitle, metaDescription, metaKeywords,
            whyTitle, whyContent, whyJKShahTitle, whyJKShahContent, sequence
        } = req.body;

        const category = await Category.create({
            name,
            description,
            parent: parent || null,
            slug: slug || "",
            metaTitle: metaTitle || "",
            metaDescription: metaDescription || "",
            metaKeywords: metaKeywords || "",
            whyTitle: whyTitle || "",
            whyTitle: whyTitle || "",
            whyContent: whyContent || "",
            whyJKShahTitle: whyJKShahTitle || "",
            whyJKShahContent: whyJKShahContent || "",
            sequence: sequence || 0
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check for dependencies before deletion
        if (!category.parent) {
            // It's a Main Category
            // 1. Check if it has sub-categories
            const subCategoriesCount = await Category.countDocuments({ parent: category._id });
            if (subCategoriesCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it has ${subCategoriesCount} sub-categories. Please delete them first.`
                });
            }

            // 2. Check if any Course uses this category
            const coursesCount = await Course.countDocuments({ category: category.name });
            if (coursesCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it is used in ${coursesCount} courses.`
                });
            }

            // 3. Check if any RankHolder uses this category
            const rankHoldersCount = await RankHolder.countDocuments({ category: category.name });
            if (rankHoldersCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it is used by ${rankHoldersCount} rank holders.`
                });
            }

        } else {
            // It's a Sub-Category
            // 1. Check if any Course uses this sub-category
            const coursesCount = await Course.countDocuments({ subCategory: category.name });
            if (coursesCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it is used in ${coursesCount} courses.`
                });
            }

            // 2. Check if CareerOpportunity config exists
            const careerOpp = await CareerOpportunity.findOne({ subCategory: category.name });
            if (careerOpp) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it has a configured Career Opportunity section.`
                });
            }

            // 3. Check if CourseTimeline exists
            const timeline = await CourseTimeline.findOne({ subCategory: category.name });
            if (timeline) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot delete '${category.name}' because it has a configured Course Timeline.`
                });
            }
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
