const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const LandingPageContent = require('./models/LandingPageContent');

async function dumpContent() {
    await mongoose.connect(process.env.MONGODB_URI);
    const content = await LandingPageContent.findOne();
    console.log(JSON.stringify(content, null, 2));
    process.exit();
}

dumpContent();
