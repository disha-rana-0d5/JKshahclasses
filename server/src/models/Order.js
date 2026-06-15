const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Optional for guest checkout
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        productType: {
            type: String,
            enum: ['book', 'test-series', 'course'],
            default: 'book'
        },
        title: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            default: 1
        },
        image: String,
        variantId: String,
        variantName: String
    }],
    customerInfo: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        mobile: { type: String, required: true }
    },
    shippingAddress: {
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    billingAddress: {
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: true
    },
    paymentId: {
        type: String
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    trackingInfo: {
        awbNumber: { type: String },
        courierName: { type: String },
        trackingUrl: { type: String }
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
