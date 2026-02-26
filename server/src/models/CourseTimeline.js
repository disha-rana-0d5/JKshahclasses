const mongoose = require('mongoose');

const courseTimelineSchema = new mongoose.Schema({
    subCategory: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CourseTimeline', courseTimelineSchema);
