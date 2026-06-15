const mongoose = require('mongoose');
const Category = require('./server/src/models/Category');
const dotenv = require('dotenv');

dotenv.config({ path: './server/.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories to check.`);

        for (const cat of categories) {
            let updated = false;

            // Why Content
            if (cat.whyContent && (!cat.whyPoints || cat.whyPoints.every(p => !p))) {
                cat.whyPoints = [cat.whyContent, "", "", "", "", "", ""];
                updated = true;
            } else if (!cat.whyPoints || cat.whyPoints.length === 0) {
                cat.whyPoints = ["", "", "", "", "", "", ""];
                updated = true;
            }

            // Why JK Shah Content
            if (cat.whyJKShahContent && (!cat.whyJKShahPoints || cat.whyJKShahPoints.every(p => !p))) {
                cat.whyJKShahPoints = [cat.whyJKShahContent, "", "", "", "", "", ""];
                updated = true;
            } else if (!cat.whyJKShahPoints || cat.whyJKShahPoints.length === 0) {
                cat.whyJKShahPoints = ["", "", "", "", "", "", ""];
                updated = true;
            }

            if (updated) {
                await cat.save();
                console.log(`Migrated category: ${cat.name}`);
            }
        }

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
