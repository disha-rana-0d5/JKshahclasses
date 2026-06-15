const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const RankHolder = mongoose.model('RankHolder', new mongoose.Schema({}, { strict: false }), 'rankholders');
const paginate = require('./src/utils/paginate');

async function verify() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // Simulate backend controller logic
    const testCases = [
        {
            name: "Query for 11th - 12th Commerce course page (category=11th - 12th Commerce)",
            query: { category: "11th - 12th Commerce" }
        },
        {
            name: "Query for CA course page (subCategory=CA)",
            query: { subCategory: "CA" }
        },
        {
            name: "Query for CS course page (subCategory=CS)",
            query: { subCategory: "CS" }
        },
        {
            name: "Admin dashboard filter for subcategory (filter={category: 'CA'})",
            query: { filter: JSON.stringify({ category: "CA" }) }
        }
    ];

    for (const testCase of testCases) {
        console.log(`\n--- Test Case: ${testCase.name} ---`);
        let { category, subCategory, course, filter } = testCase.query;

        let filterObj = {};
        if (filter) {
            try {
                filterObj = typeof filter === 'string' ? JSON.parse(filter) : filter;
            } catch (e) {
                console.error('Error parsing filter:', e);
            }
        }

        const targetCategory = category || filterObj.category;
        const targetSubCategory = subCategory || filterObj.subCategory;
        const targetCourse = course || filterObj.course;

        const baseQuery = {};
        if (targetCourse) baseQuery.course = targetCourse;

        if (targetCategory && targetSubCategory) {
            baseQuery.$or = [
                { category: targetCategory, subCategory: targetSubCategory },
                { category: targetSubCategory },
                { subCategory: targetSubCategory }
            ];
        } else if (targetCategory) {
            baseQuery.$or = [
                { category: targetCategory },
                { subCategory: targetCategory }
            ];
        } else if (targetSubCategory) {
            baseQuery.$or = [
                { subCategory: targetSubCategory },
                { category: targetSubCategory }
            ];
        }

        if (filterObj.category) delete filterObj.category;
        if (filterObj.subCategory) delete filterObj.subCategory;
        if (filterObj.course) delete filterObj.course;

        const modifiedQuery = { ...testCase.query };
        if (filter) {
            modifiedQuery.filter = JSON.stringify(filterObj);
        }

        const options = {
            searchFields: ['name', 'category', 'subCategory', 'course', 'session'],
            sort: '-createdAt',
            baseQuery
        };

        const result = await paginate(RankHolder, modifiedQuery, options);
        console.log(`Count: ${result.data.length}`);
        if (result.data.length > 0) {
            console.log("Sample records:");
            result.data.slice(0, 3).forEach(r => {
                console.log(`  - Name: "${r.name}", Category: "${r.category}", SubCategory: "${r.subCategory}", Course: "${r.course}"`);
            });
        }
    }

    process.exit(0);
}

verify();
