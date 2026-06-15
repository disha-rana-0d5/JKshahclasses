const mongoose = require('mongoose');
require('dotenv').config();

console.log('Connecting to MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected!');
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });

setTimeout(() => {
    console.log('Timeout after 10s');
    process.exit(1);
}, 10000);
