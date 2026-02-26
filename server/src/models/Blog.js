const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a blog title'],
        trim: true,
        maxlength: [200, 'Title cannot be more than 200 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogCategory',
        required: true
    },
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    description: {
        type: String,
        required: [true, 'Please add a blog description']
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    author: {
        type: String,
        default: 'Admin'
    },
    metaTitle: {
        type: String,
        trim: true
    },
    metaDescription: {
        type: String,
        trim: true
    },
    metaKeywords: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Blog', blogSchema);
