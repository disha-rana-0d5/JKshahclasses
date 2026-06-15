const mongoose = require('mongoose');

const ERPCourseMappingSchema = new mongoose.Schema({
    erpCourseId: {
        type: String,
        required: true,
        unique: true
    },
    courseName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
        required: true
    },
    isVisible: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('ERPCourseMapping', ERPCourseMappingSchema);
