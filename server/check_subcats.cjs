require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./src/models/Category');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jkshah');
    
    console.log("--- Global Pathways Parent ---");
    const parent = await Category.findOne({ name: 'Global Pathways' });
    if (parent) {
        const subcats = await Category.find({ parent: parent._id });
        for (let s of subcats) {
            console.log(`SubCat: '${s.name}', Seq: ${s.sequence}`);
        }
    } else {
        console.log("Parent not found.");
    }

    process.exit(0);
}
test();
