require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Course = require('./src/models/Course');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jkshah');
    const categories = await Category.find();
    const courses = await Course.find();
    
    const catNames = new Set(categories.map(c => c.name));
    
    console.log("Orphaned Course Categories:");
    for (let c of courses) {
        if (!catNames.has(c.category) && !catNames.has(c.subCategory)) {
             console.log(`Course: ${c.title} -> category: '${c.category}', subCategory: '${c.subCategory}'`);
        }
    }
    process.exit(0);
}
test();
