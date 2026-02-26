const mongoose = require('mongoose');

const careerOpportunitySchema = new mongoose.Schema({
    subCategory: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    opportunities: {
        type: [String],
        required: true,
        validate: [val => val.length === 8, 'Exactly 8 opportunities are required']
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CareerOpportunity', careerOpportunitySchema);
