const mongoose = require('mongoose');

const paymentEnquirySchema = new mongoose.Schema({
    enqId: {
        type: String,
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    mobileNumber: {
        type: String,
        default: ''
    },
    course: {
        type: String,
        default: ''
    },
    level: {
        type: String,
        default: ''
    },
    attempt: {
        type: String,
        default: ''
    },
    batch: {
        type: String,
        default: ''
    },
    amount: {
        type: String,
        default: ''
    },
    acadYear: { type: String, default: '' },
    rollNo: { type: String, default: '' },
    type: { type: String, default: '' },
    admSrc: { type: String, default: '' },
    schdlRef: { type: String, default: '' },
    payType: { type: String, default: '' },
    productinfo: { type: String, default: '' },
    compId: { type: String, default: '' },
    finGrp: { type: String, default: '' },
    status: {
        type: String,
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('PaymentEnquiry', paymentEnquirySchema);
