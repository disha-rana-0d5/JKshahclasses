const Course = require('../models/Course');
const paginate = require('../utils/paginate');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const options = {
            searchFields: ['title', 'description', 'category', 'subCategory'],
            sort: '-createdAt'
        };

        const result = await paginate(Course, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const { id } = req.params;
        let course;

        // Try to find by ID first, then by slug
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            course = await Course.findById(id);
        }

        if (!course) {
            // Transform slug back to title-like pattern (hyphens to spaces)
            const titlePattern = id.replace(/-/g, ' ');
            course = await Course.findOne({
                title: { $regex: new RegExp(`^${titlePattern}$`, 'i') }
            });
        }

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Add a course
// @route   POST /api/courses
// @access  Private (Admin)
exports.addCourse = async (req, res) => {
    try {
        const { subCategory } = req.body;

        // Check if a course with this sub-category already exists
        const existingCourse = await Course.findOne({ subCategory });
        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: 'course with these category already exist'
            });
        }

        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';
        if (!req.body.facultyImage || req.body.facultyImage === "") req.body.facultyImage = '/uploads/placeholder.png';

        if (req.body.reviewsList && Array.isArray(req.body.reviewsList)) {
            req.body.reviewsList = req.body.reviewsList.map(review => {
                if (!review.image || review.image === "") review.image = '/uploads/placeholder.png';
                return review;
            });
        }

        if (req.body.testimonials && Array.isArray(req.body.testimonials)) {
            req.body.testimonials = req.body.testimonials.map(category => {
                if (category.items && Array.isArray(category.items)) {
                    category.items = category.items.map(item => {
                        if (!item.image || item.image === "") item.image = '/uploads/placeholder.png';
                        return item;
                    });
                }
                return category;
            });
        }

        const course = await Course.create(req.body);

        res.status(201).json({
            success: true,
            data: course
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Admin)
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        if (req.body.image === "") req.body.image = '/uploads/placeholder.png';
        if (req.body.facultyImage === "") req.body.facultyImage = '/uploads/placeholder.png';

        if (req.body.reviewsList && Array.isArray(req.body.reviewsList)) {
            req.body.reviewsList = req.body.reviewsList.map(review => {
                if (review.image === "") review.image = '/uploads/placeholder.png';
                return review;
            });
        }

        if (req.body.testimonials && Array.isArray(req.body.testimonials)) {
            req.body.testimonials = req.body.testimonials.map(category => {
                if (category.items && Array.isArray(category.items)) {
                    category.items = category.items.map(item => {
                        if (item.image === "") item.image = '/uploads/placeholder.png';
                        return item;
                    });
                }
                return category;
            });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            data: course
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        await course.deleteOne();

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
