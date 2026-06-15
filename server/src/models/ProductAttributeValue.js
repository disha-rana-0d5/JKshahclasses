const mongoose = require('mongoose');

const productAttributeValueSchema = new mongoose.Schema({
    value: {
        type: String, // e.g. "Accounting", "Printed Copy"
        required: [true, 'Please add an attribute value'],
        trim: true
    },
    attribute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductAttribute',
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductAttributeValue', productAttributeValueSchema);
