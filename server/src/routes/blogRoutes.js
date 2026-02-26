const express = require('express');
const router = express.Router();
const {
    getBlogCategories,
    createBlogCategory,
    updateBlogCategory,
    deleteBlogCategory
} = require('../controllers/blogCategoryController');
const {
    getBlogs,
    getBlog,
    createBlog,
    updateBlog,
    deleteBlog
} = require('../controllers/blogController');

// Blog Categories Routes
router.get('/categories', getBlogCategories);
router.post('/categories', createBlogCategory);
router.put('/categories/:id', updateBlogCategory);
router.delete('/categories/:id', deleteBlogCategory);

// Blog Routes
router.get('/', getBlogs);
router.get('/:id', getBlog);
router.post('/', createBlog);
router.put('/:id', updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;
