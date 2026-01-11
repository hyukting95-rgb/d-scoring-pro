const mongoose = require('mongoose');

const PersonnelSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  person: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  entryTime: {
    type: String,
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  workDays: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Personnel', PersonnelSchema);