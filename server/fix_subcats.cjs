require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('./src/models/Course');
const Category = require('./src/models/Category');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jkshah');
    
    // Assign subCategory ACCA
    await Course.updateOne({ title: 'Association of Chartered Certified Accountants (ACCA)' }, { $set: { subCategory: 'ACCA' }});
    await Course.updateOne({ title: 'Chartered Financial Analyst (CFA)' }, { $set: { subCategory: 'CFA' }});
    await Course.updateOne({ title: 'Certified Management Accountant- CMA USA' }, { $set: { subCategory: 'CMA USA' }});
    
    console.log("Updated subcategories in DB!");
    process.exit(0);
}
test();
