const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Course = require('./src/models/Course');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const courses = await Course.find({
        title: {
            $regex: /CA|ACCA|CFA|CPA|CMA|Company Secretary|Chartered Accountant/i
        }
    }, 'title slug category subCategory');
    console.log(JSON.stringify(courses, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
