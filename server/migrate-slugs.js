const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const Course = require('./src/models/Course');

const migrate = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const courses = await Course.find();
        console.log(`Found ${courses.length} courses to migrate.`);

        for (const course of courses) {
            if (!course.slug) {
                // Pre-save hook will generate the slug
                await course.save();
                console.log(`Updated course: ${course.title} -> ${course.slug}`);
            } else {
                console.log(`Skipping course (already has slug): ${course.title}`);
            }
        }

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
