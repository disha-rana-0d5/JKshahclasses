require('dotenv').config({ path: '/home/jkshah/public_html/JKshah/server/.env' });
const mongoose = require('mongoose');
const RankHolder = require('./server/src/models/RankHolder');

async function test() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jkshah');
    const rankers = await RankHolder.find().select('session name').limit(20);
    console.log("Sessions:");
    rankers.forEach(r => console.log(r.session));
    process.exit(0);
}
test();
