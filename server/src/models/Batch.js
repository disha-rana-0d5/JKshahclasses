const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
    location: {
        type: String,
        trim: true
    },
    categories: [{
        type: String,
        required: [true, 'Please select at least one course category']
    }],
    level: {
        type: String,
        required: [true, 'Please select a level']
    },
    mode: {
        type: String,
        required: [true, 'Please select a mode'],
        enum: ['Face to Face', 'Live Online', 'Recorded']
    },
    language: {
        type: String,
        trim: true,
        enum: ['English', 'Hindi', ''], // empty string or undefined allowed if not required
        default: ''
    },
    startDate: {
        type: String,
        required: [true, 'Please add a start date']
    },
    dayTiming: {
        type: String,
        required: [true, 'Please add day and timing']
    },
    examAttempt: {
        type: String,
        required: [true, 'Please add exam attempt']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Batch', batchSchema);
