const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    overview: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Please select a category']
    },
    subCategory: {
        type: String,
        default: ''
    },
    level: {
        type: String,
        required: [true, 'Please select a level']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    originalPrice: {
        type: Number
    },
    duration: {
        type: String,
        required: [true, 'Please add duration (e.g., 6 Months)']
    },
    lessons: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    reviews: {
        type: Number,
        default: 0
    },
    facultyName: {
        type: String,
        default: ''
    },
    facultyImage: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    discount: {
        type: String // e.g., "20% OFF"
    },
    highlights: {
        type: [String],
        default: []
    },
    tags: {
        type: [String],
        default: []
    },
    enrolledTotal: {
        type: Number,
        default: 0
    },
    enrolledRecent: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Draft', 'Archived'],
        default: 'Draft'
    },
    image: {
        type: String,
        default: '/uploads/placeholder.png'
    },
    batchInfo: {
        type: String,
        default: 'New Batch'
    },
    // Syllabus Information
    syllabusModules: {
        type: [{
            title: String,
            sequence: { type: Number, default: 0 },
            topics: [{
                title: String,
                details: String,
                sequence: { type: Number, default: 0 },
                subjects: [{
                    name: String,
                    price: String
                }]
            }],
            duration: String,
            pdfUrl: String
        }],
        default: []
    },
    // Faculty Details
    facultyDesignation: {
        type: String,
        default: ''
    },
    facultySpecialization: {
        type: String,
        default: ''
    },
    facultyExperience: {
        type: String,
        default: ''
    },
    facultyStudents: {
        type: String,
        default: ''
    },
    facultyRating: {
        type: Number,
        default: 4.8,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    facultyBio: {
        type: String,
        default: ''
    },
    // Course Content Details
    courseFeatures: {
        type: [String],
        default: []
    },
    whatYouLearn: {
        type: [String],
        default: []
    },
    whoShouldEnroll: {
        type: [String],
        default: []
    },
    // Student Reviews
    reviewsList: {
        type: [{
            name: { type: String, required: true },
            rating: { type: Number, required: true, min: 1, max: 5 },
            date: { type: String, default: () => new Date().toLocaleDateString() },
            text: { type: String, required: true },
            achievement: { type: String, default: '' },
        }],
        default: []
    },
    demoVideos: {
        type: [{
            title: String,
            url: String,
            description: String,
            thumbnail: String
        }],
        default: []
    },
    videos: {
        type: [{
            title: String,
            url: String,
            description: String,
            thumbnail: String
        }],
        default: []
    },
    faqs: {
        type: [{
            category: String,
            topics: [{
                title: String,
                questions: [{
                    question: String,
                    answer: String
                }]
            }]
        }],
        default: []
    },
    testimonials: {
        type: [{
            category: String, // e.g., "CA Final Rankers"
            items: [{
                name: { type: String, required: true },
                message: { type: String, required: true },
                image: { type: String, default: '/uploads/placeholder.png' },
                videoUrl: { type: String, default: '' },
                designation: { type: String, default: 'Student' } // e.g. "AIR 1, CA Final"
            }]
        }],
        default: []
    },
    brochureUrl: {
        type: String,
        default: ''
    },
    syllabusPdf: {
        type: String,
        default: ''
    },
    metaTitle: {
        type: String,
        trim: true,
        default: ""
    },
    metaDescription: {
        type: String,
        trim: true,
        default: ""
    },
    metaKeywords: {
        type: String,
        trim: true,
        default: ""
    }
}, {
    timestamps: true
});

// Create course slug from the title

module.exports = mongoose.model('Course', courseSchema);
