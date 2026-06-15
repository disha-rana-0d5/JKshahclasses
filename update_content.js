const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LandingPageContent = require('./server/src/models/LandingPageContent');

dotenv.config({ path: './server/.env' });

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log("Connected to DB.");
    const content = await LandingPageContent.findOne();
    if (content) {
        content.footerCta.description = "Join 500,000+ students building their professional future.";
        await content.save();
        console.log("Updated footer CTA text.");
    } else {
        console.log("No LandingPageContent found.");
    }
    mongoose.disconnect();
}).catch(console.error);
