const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Faculty = require('../src/models/Faculty');

dotenv.config();

const seedNewFaculty = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const newFaculty = new Faculty({
            name: "Prof. Anjali Mehta",
            designation: "Head Faculty - Corporate Laws",
            expertise: "Law",
            experience: 18,
            rating: "4.9",
            totalStudents: "10,500+",
            coursesTaught: ["CS Executive", "CS Professional", "CA Inter"],
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
            specialization: "Corporate Law & Compliance",
            qualifications: ["CS", "LLB", "MBA"],
            tagline: "Empowering students with legal excellence",
            achievements: ["380+ Top Rankers", "Supreme Court Advocate", "TEDx Speaker"]
        });

        await newFaculty.save();
        console.log('New faculty added successfully:', newFaculty.name);

        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding faculty:', err);
        process.exit(1);
    }
};

seedNewFaculty();
