const Blog = require('../models/Blog');
const paginate = require('../utils/paginate');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
    try {
        // Filter by category if provided in query
        const baseQuery = {};
        if (req.query.category) {
            baseQuery.category = req.query.category;
        }

        const options = {
            searchFields: ['title', 'description'],
            sort: '-createdAt',
            populate: { path: 'category', select: 'name' },
            baseQuery
        };

        const result = await paginate(Blog, req.query, options);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get single blog
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlog = async (req, res) => {
    try {
        let blog;
        if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            blog = await Blog.findById(req.params.id).populate('category', 'name');
        } else {
            blog = await Blog.findOne({ slug: req.params.id }).populate('category', 'name');
        }

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add a blog
// @route   POST /api/blogs
// @access  Private/Admin
exports.createBlog = async (req, res) => {
    try {
        if (!req.body.image || req.body.image === "") req.body.image = '/uploads/placeholder.png';

        if (!req.body.slug && req.body.title) {
            req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        const blog = await Blog.create(req.body);

        res.status(201).json({ success: true, data: blog });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Slug already exists' });
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private/Admin
exports.updateBlog = async (req, res) => {
    try {
        let blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        if (req.body.image === "") req.body.image = '/uploads/placeholder.png';

        if (req.body.title && !req.body.slug) {
            req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        }

        blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: blog });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private/Admin
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        await blog.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
