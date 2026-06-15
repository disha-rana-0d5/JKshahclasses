const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    sequence: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    whyTitle: {
        type: String,
        default: ""
    },
    whyContent: {
        type: String,
        default: ""
    },
    whyJKShahTitle: {
        type: String,
        default: ""
    },
    whyJKShahContent: {
        type: String,
        default: ""
    },
    whyPoints: {
        type: [String],
        default: ["", "", "", "", "", "", ""]
    },
    whyJKShahPoints: {
        type: [String],
        default: ["", "", "", "", "", "", ""]
    },
    slug: {
        type: String,
        trim: true,
        default: ""
    },
    metaTitle: {
        type: String,
        trim: true,
        default: ""
    },
    metaDescription: {
        type: String,
        trim: true,
        default: ""
    },
    metaKeywords: {
        type: String,
        trim: true,
        default: ""
    },
    bannerTitle: {
        type: String,
        default: ""
    },
    bannerSubtitle: {
        type: String,
        default: ""
    },
    bannerBadges: {
        type: [String],
        default: ["", "", ""]
    },
    bannerBadgeIcons: {
        type: [String],
        default: ["", "", ""]
    },
    bannerStats: [{
        value: { type: String, default: "" },
        label: { type: String, default: "" }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
