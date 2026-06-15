const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const RankHolder = mongoose.model('RankHolder', new mongoose.Schema({}, { strict: false }), 'rankholders');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    console.log('\n=== CA RANKERS WITH subCategory: "CA" (showing 3) ===');
    const subCARankers = await RankHolder.find({ subCategory: "CA" }).limit(3);
    subCARankers.forEach(r => {
        console.log(`Name: "${r.name}", Category: "${r.category}", SubCategory: "${r.subCategory}", Course: "${r.course}"`);
    });

    console.log('\n=== CA RANKERS WITH category: "CA" (showing 3) ===');
    const catCARankers = await RankHolder.find({ category: "CA" }).limit(3);
    catCARankers.forEach(r => {
        console.log(`Name: "${r.name}", Category: "${r.category}", SubCategory: "${r.subCategory}", Course: "${r.course}"`);
    });

    process.exit(0);
}

test();
