const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    // Fix CMA India
    const cmaIndia = await Course.findOne({ slug: 'cost-and-management-accountant-cma-india' });
    if (cmaIndia) {
        cmaIndia.slug = 'cma-india';
        await cmaIndia.save();
        console.log("Updated CMA India slug to 'cma-india'");
    } else {
        console.log("CMA India old slug not found. (Maybe already updated?)");
    }
    
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
