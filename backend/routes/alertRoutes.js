const express = require('express');
const router = express.Router();
const Alert = require('../models/Alert');
const { protect, authorize } = require('../middleware/auth');

// Get all alerts for user's farms
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query; // 'read' or 'unread'

    let query = {};
    if (status === 'unread') query.isRead = false;
    if (status === 'read') query.isRead = true;

    const alerts = await Alert.find(query)
      .populate('farm')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, alerts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark alert as read
router.patch('/:id/read', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete alert
router.delete('/:id', protect, async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
