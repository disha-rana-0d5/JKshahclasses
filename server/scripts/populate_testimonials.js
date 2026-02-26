const mongoose = require('mongoose');
const LandingPageContent = require('../src/models/LandingPageContent');
require('dotenv').config({ path: '../.env' });

const defaultTestimonials = [
    {
        name: "Priya Sharma",
        rank: "AIR 45, CA Final",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
        text: "The faculty's expertise and personalized attention helped me secure top rank."
    },
    {
        name: "Rahul Desai",
        rank: "Distinction, CS Executive",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
        text: "Comprehensive material and mock tests gave me confidence to clear in first attempt."
    },
    {
        name: "Anjali Patel",
        rank: "AIR 122, CMA Inter",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
        text: "Blended learning approach helped me balance work and studies perfectly."
    },
    {
        name: "Karan Mehta",
        rank: "Distinction, CA Foundation",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=200",
        text: "Best decision for my career. Teachers are always available for doubt clearing."
    }
];

async function populate() {
    try {
        console.log('Connecting to MongoDB...');
        const uri = "mongodb+srv://viralajudia123:JKshah@jkshahinstitute.hvopbxf.mongodb.net/jkshah?retryWrites=true&w=majority";
        await mongoose.connect(uri);
        console.log('Connected.');

        const content = await LandingPageContent.findOne();
        if (!content) {
            console.log('No LandingPageContent found.');
            return;
        }

        if (!content.testimonials || !content.testimonials.list || content.testimonials.list.length === 0) {
            console.log('Populating testimonials...');
            content.testimonials = {
                title: content.testimonials?.title || 'Student Success Stories',
                list: defaultTestimonials
            };
            await content.save();
            console.log('Testimonials populated successfully.');
        } else {
            console.log('Testimonials already exist. No changes made.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

populate();
