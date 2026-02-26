const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');
const Category = require('./src/models/Category');
const Level = require('./src/models/Level');

dotenv.config();

const seedCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing courses
        await Course.deleteMany();
        console.log('Cleared existing courses');

        // Fetch all categories and levels
        const categories = await Category.find();
        const levels = await Level.find();

        if (levels.length === 0) {
            console.log('No levels found. Please seed levels first.');
            process.exit(1);
        }

        const subCategories = categories.filter(cat => cat.parent !== null);
        console.log(`Found ${subCategories.length} sub-categories`);

        const coursesToSeed = subCategories.map(subCat => {
            const parentCat = categories.find(c => c._id.toString() === subCat.parent.toString());
            return {
                title: `${subCat.name} Full Course`,
                description: `Comprehensive ${subCat.name} preparation with expert faculties.`,
                category: parentCat ? parentCat.name : 'Uncategorized',
                subCategory: subCat.name,
                level: levels[0].name, // Default to first level
                price: 15000,
                originalPrice: 20000,
                duration: '6 Months',
                lessons: 120,
                rating: 4.8,
                reviews: 150,
                facultyName: 'Dr. Expert',
                facultyImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                discount: '25% OFF',
                status: 'Active',
                image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100'
            };
        });

        await Course.insertMany(coursesToSeed);
        console.log(`Successfully seeded ${coursesToSeed.length} courses`);

        process.exit();
    } catch (error) {
        console.error('Error seeding courses:', error);
        process.exit(1);
    }
};

seedCourses();
