require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Category = require('./src/models/Category');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jkshah');
    
    console.log("--- Categories ---");
    const cats = await Category.find();
    for (let c of cats) {
        if(c.name.toLowerCase().includes('global')) console.log(`Cat: '${c.name}' (Parent: ${c.parent ? 'Yes' : 'No'}, Seq: ${c.sequence})`);
    }

    console.log("\n--- Courses matching Global Pathways ---");
    const globalCourses = await Course.find({ category: /Global/i });
    for (let c of globalCourses) {
        console.log(`Course: '${c.title}', Seq: ${c.sequence}, Status: '${c.status}', Category: '${c.category}', SubCat: '${c.subCategory}'`);
    }

    process.exit(0);
}
test();
