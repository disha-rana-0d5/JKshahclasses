const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    placementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Placement',
        required: true
    },
    studentName: {
        type: String,
        required: [true, 'Please add your name'],
        trim: true
    },
    studentEmail: {
        type: String,
        required: [true, 'Please add your email'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    studentPhone: {
        type: String,
        required: [true, 'Please add your phone number']
    },
    qualification: {
        type: String,
        required: [true, 'Please add your professional qualification being pursued'],
        trim: true
    },
    resumeUrl: {
        type: String,
        required: [true, 'Please upload your resume']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema);
