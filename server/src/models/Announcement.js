const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Please add content']
    },
    type: {
        type: String,
        enum: ['exam', 'class', 'general', 'result'],
        default: 'general'
    },
    attachments: [
        {
            name: { type: String },
            url: { type: String },
            fileType: { type: String, enum: ['image', 'pdf'] }
        }
    ],
    isActive: {
        type: Boolean,
        default: true
    },
    publishDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
