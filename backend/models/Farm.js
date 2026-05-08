const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Farm name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  latitude: Number,
  longitude: Number,
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required']
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  cropType: {
    type: String,
    enum: ['rice', 'wheat', 'corn', 'cotton', 'sugarcane', 'vegetables', 'fruits', 'other'],
    default: 'other'
  },
  areaInHectares: Number,
  thresholds: {
    minTemperature: { type: Number, default: 15 },
    maxTemperature: { type: Number, default: 35 },
    minHumidity: { type: Number, default: 40 },
    maxHumidity: { type: Number, default: 95 },
    minSoilMoisture: { type: Number, default: 20 },
    maxSoilMoisture: { type: Number, default: 80 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Farm', farmSchema);
