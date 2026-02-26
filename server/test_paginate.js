const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const paginate = require('./src/utils/paginate');
const dotenv = require('dotenv');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const query = {
            filter: JSON.stringify({ parent: null })
        };

        const options = {
            searchFields: ['name', 'slug'],
            sort: { createdAt: -1 }
        };

        console.log('Testing paginate with filter:', query.filter);
        const result = await paginate(Category, query, options);
        console.log('Result count:', result.count);
        console.log('Pagination metadata:', result.pagination);
        console.log('Data names:', result.data.map(c => c.name));

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        process.exit(0);
    }
};

test();
