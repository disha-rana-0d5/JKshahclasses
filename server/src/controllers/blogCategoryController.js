const BlogCategory = require('../models/BlogCategory');
const Blog = require('../models/Blog');
const paginate = require('../utils/paginate');

// @desc    Get all blog categories
// @route   GET /api/blog-categories
// @access  Public
exports.getBlogCategories = async (req, res) => {
    try {
        const result = await paginate(BlogCategory, req.query, {
            searchFields: ['name'],
            sort: 'name'
        });

        // Attach counts to each category
        const categoriesWithCounts = await Promise.all(
            result.data.map(async (cat) => {
                const count = await Blog.countDocuments({ category: cat._id });
                return { ...cat.toObject(), blogCount: count };
            })
        );

        // If 'onlyActive' is requested, filter out those with 0 blogs
        if (req.query.onlyActive === 'true') {
            result.data = categoriesWithCounts.filter(cat => cat.blogCount > 0);
            result.count = result.data.length;
            // Note: This might mess up backend pagination 'total' if many are empty,
            // but for a sidebar list it works well.
        } else {
            result.data = categoriesWithCounts;
        }

        res.status(200).json(result);
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Create blog category
// @route   POST /api/blog-categories
// @access  Private/Admin
exports.createBlogCategory = async (req, res) => {
    try {
        if (!req.body.slug && req.body.name) {
            req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        const category = await BlogCategory.create(req.body);
        res.status(201).json({
            success: true,
            data: category
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Category or slug already exists' });
        }
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Update blog category
// @route   PUT /api/blog-categories/:id
// @access  Private/Admin
exports.updateBlogCategory = async (req, res) => {
    try {
        if (req.body.name && !req.body.slug) {
            req.body.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        const category = await BlogCategory.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// @desc    Delete blog category
// @route   DELETE /api/blog-categories/:id
// @access  Private/Admin
exports.deleteBlogCategory = async (req, res) => {
    try {
        const category = await BlogCategory.findById(req.params.id);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};
