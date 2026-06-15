const mongoose = require('mongoose');

const careerApplicationSchema = new mongoose.Schema({
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CareerListing',
        required: false // Optional if they apply generally
    },
    name: {
        type: String,
        required: [true, 'Please add your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add your email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add your phone number']
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    postApplied: {
        type: String,
        required: [true, 'Please specify the post applied for'],
        trim: true
    },
    resumeUrl: {
        type: String,
        required: [true, 'Please upload your resume']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CareerApplication', careerApplicationSchema);
