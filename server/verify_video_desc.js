const mongoose = require('mongoose');
const Course = require('./src/models/Course');
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

const verifyVideoDescription = async () => {
    await connectDB();

    try {
        console.log('Creating test course...');
        const course = await Course.create({
            title: 'Test Course Video Description',
            description: 'Test Description',
            category: 'Test Category',
            subCategory: 'Test SubCategory',
            level: 'Test Level',
            price: 100,
            duration: '1 Month',
            facultyName: 'Test Faculty',
            status: 'Draft'
        });

        console.log('Course created:', course._id);

        console.log('Updating video description...');
        const videoData = [{
            title: 'Test Video',
            url: 'http://test.com/video',
            description: 'This is a test video description that should be saved.'
        }];

        const updatedCourse = await Course.findByIdAndUpdate(course._id, { videos: videoData }, { new: true });

        console.log('Updated Course Videos:', JSON.stringify(updatedCourse.videos, null, 2));

        if (updatedCourse.videos[0].description === 'This is a test video description that should be saved.') {
            console.log('SUCCESS: Video description saved correctly.');
        } else {
            console.error('FAILURE: Video description mismatch.');
        }

        console.log('Cleaning up...');
        await Course.findByIdAndDelete(course._id);
        console.log('Test course deleted.');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

verifyVideoDescription();
