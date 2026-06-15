const mongoose = require('mongoose');

const productVariationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a variation name'],
        trim: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSubCategory',
        required: true
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
});

// Create variation slug from the name
productVariationSchema.pre('save', async function () {
    if (!this.isModified('name')) return;

    this.slug = this.name.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
});

module.exports = mongoose.model('ProductVariation', productVariationSchema);
