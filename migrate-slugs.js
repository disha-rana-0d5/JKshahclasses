const mongoose = require('mongoose');
const Product = require('./server/src/models/Product');
require('dotenv').config();

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

async function migrateSlugs() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${products.length} products without slugs`);

        for (const product of products) {
            product.slug = slugify(product.title);
            await product.save();
            console.log(`Updated: ${product.title} -> ${product.slug}`);
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateSlugs();
