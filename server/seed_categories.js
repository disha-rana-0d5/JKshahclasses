const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Course = require('./src/models/Course');
require('dotenv').config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing categories and courses for demo (Optional, but safer for a clean demo)
        // await Category.deleteMany({});
        // await Course.deleteMany({});

        // Add Parents
        const indian = await Category.findOneAndUpdate(
            { name: 'Indian Course' },
            { name: 'Indian Course', description: 'Professional courses in India' },
            { upsert: true, new: true }
        );
        const foreign = await Category.findOneAndUpdate(
            { name: 'Foreign Course' },
            { name: 'Foreign Course', description: 'International professional courses' },
            { upsert: true, new: true }
        );

        // Add Children
        const ca = await Category.findOneAndUpdate(
            { name: 'CA' },
            { name: 'CA', description: 'Chartered Accountancy', parent: indian._id },
            { upsert: true, new: true }
        );
        const cs = await Category.findOneAndUpdate(
            { name: 'CS' },
            { name: 'CS', description: 'Company Secretary', parent: indian._id },
            { upsert: true, new: true }
        );
        const one = await Category.findOneAndUpdate(
            { name: '1' },
            { name: '1', description: 'Foreign Course 1', parent: foreign._id },
            { upsert: true, new: true }
        );
        const two = await Category.findOneAndUpdate(
            { name: '2' },
            { name: '2', description: 'Foreign Course 2', parent: foreign._id },
            { upsert: true, new: true }
        );

        console.log('Categories seeded successfully');

        // Add some dummy courses if they don't exist
        const dummyCourses = [
            {
                title: 'CA Foundation Complete',
                description: 'Comprehensive CA Foundation course',
                category: 'CA',
                level: 'Foundation',
                price: 25000,
                facultyName: 'Dr. J.K. Shah',
                status: 'Active',
                duration: '6 Months'
            },
            {
                title: 'CS Executive Program',
                description: 'Full course for CS Executive',
                category: 'CS',
                level: 'Executive',
                price: 35000,
                facultyName: 'Dr. J.K. Shah',
                status: 'Active',
                duration: '12 Months'
            },
            {
                title: 'Global Finance 1',
                description: 'Detailed course for International Finance',
                category: '1',
                level: 'Advanced',
                price: 150000,
                facultyName: 'Dr. J.K. Shah',
                status: 'Active',
                duration: '18 Months'
            }
        ];

        for (const courseData of dummyCourses) {
            await Course.findOneAndUpdate(
                { title: courseData.title },
                courseData,
                { upsert: true }
            );
        }

        console.log('Courses seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seed();
