const mongoose = require('mongoose');

const productFacultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a faculty name'],
        trim: true
    },
    bio: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('ProductFaculty', productFacultySchema);
