const mongoose = require('mongoose');

const climateDataSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm',
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  humidity: {
    type: Number,
    required: true
  },
  soilMoisture: {
    type: Number,
    required: true
  },
  airQuality: {
    type: String,
    enum: ['Good', 'Fair', 'Moderate', 'Poor', 'Very Poor'],
    default: 'Fair'
  },
  windSpeed: Number,
  rainfall: Number,
  source: {
    type: String,
    enum: ['api', 'manual'],
    default: 'api'
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('ClimateData', climateDataSchema);
