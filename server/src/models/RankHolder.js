const mongoose = require('mongoose');

const rankHolderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    category: {
        type: String,
        trim: true,
        default: ""
    },
    subCategory: {
        type: String,
        trim: true,
        default: ""
    },
    globalRank: {
        type: String,
        default: "",
        trim: true
    },
    indiaRank: {
        type: String,
        default: "",
        trim: true
    },
    course: {
        type: String,
        required: true,
        trim: true
    },
    session: {
        type: String,
        required: true,
        trim: true
    },
    showOnLandingPage: {
        type: Boolean,
        default: false
    },
    score: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RankHolder', rankHolderSchema);
