const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
    dateOfNotice: {
        type: Date,
        default: Date.now
    },
    firmName: {
        type: String,
        required: [true, 'Please add a firm/company name'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        trim: true
    },
    domainKnowledge: {
        type: String,
        required: [true, 'Please add domain knowledge requirements'],
        trim: true
    },
    preferredCandidate: {
        type: String,
        required: [true, 'Please add preferred candidate details'],
        trim: true
    },
    remuneration: {
        type: String,
        required: [true, 'Please add expected remuneration'],
        trim: true
    },
    contactEmail: {
        type: String,
        required: [true, 'Please add a contact email for notifications'],
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    companyPage: {
        type: String,
        trim: true
    },
    applicationFormUrl: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected'],
        default: 'Pending'
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
}, {
    timestamps: true
});

// Index for automatic expiration if needed, or query-based filtering
placementSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Placement', placementSchema);
