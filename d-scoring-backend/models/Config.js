const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    default: 'scoring',
  },
  cmf: [{
    label: String,
    value: Number,
  }],
  cmfp: [{
    mode: String,
    main: Number,
    support: Number,
  }],
  base4: [{
    label: String,
    value: Number,
  }],
  base5: [{
    label: String,
    value: Number,
  }],
  addons: [{
    id: String,
    label: String,
    score: Number,
  }],
  package: [{
    type: String,
    score: Number,
  }],
  manual: [{
    type: String,
    score: Number,
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Config', ConfigSchema);