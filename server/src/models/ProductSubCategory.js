const mongoose = require('mongoose');

const productSubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a sub-category name'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory',
        required: true
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Create subcategory slug from the name
productSubCategorySchema.pre('save', async function () {
    if (!this.isModified('name')) return;

    this.slug = this.name.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
});

module.exports = mongoose.model('ProductSubCategory', productSubCategorySchema);
