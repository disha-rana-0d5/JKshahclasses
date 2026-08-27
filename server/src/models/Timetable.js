const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  branch: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  batchName: {
    type: String,
    required: true,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  pdfUrl: {
    type: String,
    default: null,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
