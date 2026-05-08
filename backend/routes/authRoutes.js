const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, username, email, password, phoneNumber, farmName, farmLocation } = req.body;

    // Check if user already exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    user = new User({
      firstName,
      lastName,
      username,
      email,
      password,
      role: 'user'
    });

    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username/email and password' });
    }

    // Check if input is email or username
    const isEmail = username.includes('@');
    const query = isEmail ? { email: username } : { username };

    let user = await User.findOne(query).select('+password');
    
    // Special case for admin login
    if (isEmail && username === 'admin@gmail.com' && password === '123456') {
      // Create admin user if not exists
      user = await User.findOne({ email: 'admin@gmail.com' });
      if (!user) {
        user = new User({
          firstName: 'Admin',
          lastName: 'User',
          username: 'admin',
          email: 'admin@gmail.com',
          password: '123456',
          role: 'admin'
        });
        await user.save();
      } else {
        // Ensure role is admin
        if (user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
        }
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For regular users, check password
    if (!(isEmail && username === 'admin@gmail.com' && password === '123456')) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('farms');
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
