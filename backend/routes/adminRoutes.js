const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Farm = require('../models/Farm');
const ClimateData = require('../models/ClimateData');
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// Get dashboard stats (admin only)
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFarms = await Farm.countDocuments();
    const totalAlerts = await Alert.countDocuments();
    const totalClimateEntries = await ClimateData.countDocuments();

    const unreadAlerts = await Alert.countDocuments({ isRead: false });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalFarms,
        totalAlerts,
        totalClimateEntries,
        unreadAlerts,
        averageTemperature: 25.4,
        averageHumidity: 60.2
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all users (admin only)
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password').populate('farms');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all farms (admin only)
router.get('/farms', protect, authorize('admin'), async (req, res) => {
  try {
    const farms = await Farm.find().populate('owner', 'firstName lastName email');
    res.status(200).json({ success: true, farms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all climate data (admin only)
router.get('/climate-data', protect, authorize('admin'), async (req, res) => {
  try {
    const climateData = await ClimateData.find()
      .populate('farm')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({ success: true, data: climateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all alerts (admin only)
router.get('/alerts', protect, authorize('admin'), async (req, res) => {
  try {
    const alerts = await Alert.find()
      .populate('farm')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (admin only)
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Farm.deleteMany({ owner: req.params.id });
    res.status(200).json({ success: true, message: 'User and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete farm (admin only)
router.delete('/farms/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Farm.findByIdAndDelete(req.params.id);
    await ClimateData.deleteMany({ farm: req.params.id });
    await Alert.deleteMany({ farm: req.params.id });
    res.status(200).json({ success: true, message: 'Farm and associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
