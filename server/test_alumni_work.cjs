const mongoose = require('mongoose');
const AlumniWorkAt = require('./src/models/AlumniWorkAt');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://viralajudia123:JKshah@jkshahinstitute.hvopbxf.mongodb.net/jkshah?retryWrites=true&w=majority');
        console.log('Connected to DB');

        const data = {
            companyName: "",
            image: "/uploads/placeholder.png",
            category: "CA",
            subCategory: "Final",
            course: "",
            order: 0
        };

        console.log('Attempting to create with:', data);
        const item = await AlumniWorkAt.create(data);
        console.log('Success Create:', item);

        console.log('Attempting to update (empty companyName) with runValidators: true');
        const updated = await AlumniWorkAt.findByIdAndUpdate(item._id, { companyName: "" }, { new: true, runValidators: true });
        console.log('Success Update:', updated);

        await AlumniWorkAt.findByIdAndDelete(item._id);
        console.log('Cleaned up');

        process.exit(0);
    } catch (error) {
        console.error('FAILED with error:', error.message);
        if (error.errors) {
            console.error('Validation Errors:', Object.keys(error.errors).map(k => `${k}: ${error.errors[k].message}`));
        }
        process.exit(1);
    }
}

test();
