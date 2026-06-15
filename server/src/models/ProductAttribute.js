const mongoose = require('mongoose');

const productAttributeSchema = new mongoose.Schema({
    name: {
        type: String, // e.g. "Subject", "Type of Book"
        required: [true, 'Please add an attribute name'],
        trim: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSubCategory'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    isGlobal: {
        type: Boolean,
        default: false
    },
    sequence: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductAttribute', productAttributeSchema);
