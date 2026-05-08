const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  farm: {
    type: mongoose.Schema.ObjectId,
    ref: 'Farm',
    required: true
  },
  type: {
    type: String,
    enum: ['temperature', 'humidity', 'soilMoisture', 'airQuality', 'rainfall', 'custom'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  triggeredValue: Number,
  threshold: Number,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('Alert', alertSchema);
