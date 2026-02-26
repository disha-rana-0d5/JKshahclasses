const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const checkLatest = async () => {
    await connectDB();

    const Course = require('./src/models/Course');
    const Faculty = require('./src/models/Faculty');
    const RankHolder = require('./src/models/RankHolder');
    const CareerOpportunity = require('./src/models/CareerOpportunity');

    console.log('\n--- Latest Course ---');
    const course = await Course.findOne().sort({ createdAt: -1 });
    if (course) {
        console.log('Title:', course.title);
        console.log('Image:', course.image);
        console.log('Faculty Image:', course.facultyImage);
    } else {
        console.log('No courses found');
    }

    console.log('\n--- Latest Faculty ---');
    const faculty = await Faculty.findOne().sort({ createdAt: -1 });
    if (faculty) {
        console.log('Name:', faculty.name);
        console.log('Image:', faculty.image);
    } else {
        console.log('No faculty found');
    }

    console.log('\n--- Latest RankHolder ---');
    const rank = await RankHolder.findOne().sort({ createdAt: -1 });
    if (rank) {
        console.log('Name:', rank.name);
        console.log('Image:', rank.image);
    } else {
        console.log('No rank holders found');
    }

    process.exit();
};

checkLatest();
