const mongoose = require('mongoose');

const ERPBatchVisibilitySchema = new mongoose.Schema({
    erpBatchId: {
        type: String,
        required: true,
        unique: true
    },
    courseId: {
        type: String
    },
    levelId: {
        type: String
    },
    isVisible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('ERPBatchVisibility', ERPBatchVisibilitySchema);
