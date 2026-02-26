const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const dotenv = require('dotenv');
path = require('path');

dotenv.config();

const test = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const allCount = await Category.countDocuments();
    console.log('Total categories:', allCount);

    const mainCategories = await Category.find({ parent: null });
    console.log('Main categories (parent: null) count:', mainCategories.length);
    console.log('Main categories names:', mainCategories.map(c => c.name));

    const subCategories = await Category.find({ parent: { $ne: null } });
    console.log('Subcategories count:', subCategories.length);

    process.exit(0);
};

test();
