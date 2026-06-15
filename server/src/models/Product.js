const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a product title'],
        trim: true
    },
    type: {
        type: String,
        enum: ['book', 'test-series'],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    oldPrice: {
        type: Number
    },
    quantity: {
        type: Number,
        default: 0
    },
    discount: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductCategory'
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductSubCategory'
    },
    variation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariation'
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductFaculty'
    },
    publisher: {
        type: String,
        trim: true
    },
    year: {
        type: Number
    },
    productInfo: {
        type: String
    },
    description: {
        type: String   // Rich text HTML content (from CKEditor)
    },
    terms: {
        type: String
    },
    image: {
        type: String
    },
    slug: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVariable: {
        type: Boolean,
        default: false
    },
    attributesConfig: [{
        attribute: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductAttribute'
        },
        values: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ProductAttributeValue'
        }]
    }],
    variants: [{
        attributes: {
            type: Map,
            of: mongoose.Schema.Types.ObjectId // AttributeId -> ValueId
        },
        price: Number,
        oldPrice: Number,
        quantity: {
            type: Number,
            default: 0
        },
        image: String,
        sku: String,
        isActive: {
            type: Boolean,
            default: true
        }
    }]
}, {
    timestamps: true
});

// Create product slug from the title before saving
productSchema.pre('save', function () {
    if (this.isModified('title')) {
        this.slug = this.title
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/[^\w-]+/g, '')   // Remove all non-word chars
            .replace(/--+/g, '-');    // Replace multiple - with single -
    }
});

module.exports = mongoose.model('Product', productSchema);
