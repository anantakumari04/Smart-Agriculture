const express = require('express');
const router = express.Router();
const Farm = require('../models/Farm');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Get all farms for user
router.get('/', protect, async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user.id });
    res.status(200).json({ success: true, farms });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single farm
router.get('/:id', protect, async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }
    res.status(200).json({ success: true, farm });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create farm
router.post('/', protect, async (req, res) => {
  try {
    const { name, location, latitude, longitude, phoneNumber, cropType, areaInHectares } = req.body;

    const farm = new Farm({
      name,
      location,
      latitude,
      longitude,
      phoneNumber,
      cropType,
      areaInHectares,
      owner: req.user.id
    });

    await farm.save();

    // Add farm to user
    await User.findByIdAndUpdate(req.user.id, {
      $push: { farms: farm._id }
    });

    res.status(201).json({ success: true, farm });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update farm
router.patch('/:id', protect, async (req, res) => {
  try {
    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, farm });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete farm
router.delete('/:id', protect, async (req, res) => {
  try {
    await Farm.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Farm deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
