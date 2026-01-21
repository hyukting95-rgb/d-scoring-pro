const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  type: {
    type: String,
    required: true,
  },
  projectName: {
    type: String,
    required: true,
  },
  content: {
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
  responsiblePerson: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['进行中', '已完成'],
    default: '进行中',
  },
  scoringParts: [{
    label: String,
    value: Number,
  }],
  totalWorkDays: {
    type: Number,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  creatorName: {
    type: String,
    required: true,
  },
  rawSelections: {
    selectedDesignType: String,
    selectedPackageType: String,
    selectedManualType: String,
    projectName: String,
    cmfValue: Number,
    cmfPerson: String,
    cmfWorkDays: Number,
    cmfpMode: String,
    cmfpPerson1: String,
    cmfpMainWorkDays: Number,
    cmfpPerson2: String,
    cmfpSupportWorkDays: Number,
    mainCreator: String,
    designBaseWorkDays: Number,
    isIndependent: String,
    baseScore: Number,
    selectedAddons: [String],
    addonPersons: Object,
    addonWorkDays: Object,
    packagePerson: String,
    packageWorkDays: Number,
    manualPerson: String,
    manualWorkDays: Number,
  },
});

module.exports = mongoose.model('Project', ProjectSchema);