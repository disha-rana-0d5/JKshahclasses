const mongoose = require('mongoose');

const productCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a category name'],
        unique: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['book', 'test-series'],
        default: 'book'
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Create category slug from the name
productCategorySchema.pre('save', async function () {
    if (!this.isModified('name')) return;

    this.slug = this.name.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
});

module.exports = mongoose.model('ProductCategory', productCategorySchema);
