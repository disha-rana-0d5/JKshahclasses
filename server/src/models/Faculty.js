const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    expertise: {
        type: String, // e.g., "Accounts", "Law"
        required: true
    },
    experience: {
        type: Number,
        required: true
    },
    rating: {
        type: String,
        default: "5.0"
    },
    totalStudents: {
        type: String, // e.g., "10,000+"
        required: true
    },
    coursesTaught: [{
        type: String
    }],
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [{
        type: String
    }],
    tagline: {
        type: String,
        required: true
    },
    achievements: [{
        type: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);
