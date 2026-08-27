const Timetable = require('../models/Timetable');

exports.createTimetable = async (req, res) => {
    try {
        const newTimetable = new Timetable(req.body);
        const savedTimetable = await newTimetable.save();
        res.status(201).json(savedTimetable);
    } catch (err) {
        console.error('Error creating timetable:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.bulkCreateTimetables = async (req, res) => {
    try {
        const timetables = req.body;
        if (!Array.isArray(timetables)) {
            return res.status(400).json({ message: 'Expected an array of timetables' });
        }
        const savedTimetables = await Timetable.insertMany(timetables);
        res.status(201).json(savedTimetables);
    } catch (err) {
        console.error('Error bulk creating timetables:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getTimetables = async (req, res) => {
    try {
        const { branch, courseName } = req.query;
        let filter = {};
        if (branch) {
            filter.branch = branch;
        }
        if (courseName) {
            filter.courseName = courseName;
        }

        const timetables = await Timetable.find(filter).sort({ fromDate: 1, courseName: 1 });
        res.json(timetables);
    } catch (err) {
        console.error('Error fetching timetables:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
        res.json(timetable);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.updateTimetable = async (req, res) => {
    try {
        const updatedTimetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedTimetable) return res.status(404).json({ message: 'Timetable not found' });
        res.json(updatedTimetable);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.deleteTimetable = async (req, res) => {
    try {
        const deletedTimetable = await Timetable.findByIdAndDelete(req.params.id);
        if (!deletedTimetable) return res.status(404).json({ message: 'Timetable not found' });
        res.json({ message: 'Timetable deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
