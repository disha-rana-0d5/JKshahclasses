const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./src/models/Product');

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
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const products = await Product.find({ slug: { $exists: false } });
        console.log(`Found ${products.length} products without slugs`);

        for (const product of products) {
            product.slug = slugify(product.title);
            await product.save();
            console.log(`Updated: ${product.title} -> ${product.slug}`);
        }

        // Also update existing ones to ensure they follow the pattern if needed
        const allProducts = await Product.find();
        for (const product of allProducts) {
            if (!product.slug) {
                product.slug = slugify(product.title);
                await product.save();
                console.log(`Fallback Updated: ${product.title} -> ${product.slug}`);
            }
        }

        console.log('Migration complete');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateSlugs();
