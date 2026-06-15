const mongoose = require('mongoose');

const alumniWorkAtSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: false,
        trim: true,
        default: 'Company Logo'
    },
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    category: {
        type: String,
        trim: true,
        default: ''
    },
    subCategory: {
        type: String,
        trim: true,
        default: ''
    },
    course: {
        type: String,
        trim: true,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AlumniWorkAt', alumniWorkAtSchema);
