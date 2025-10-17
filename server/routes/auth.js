const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Admin Login (Master Password)
router.post('/admin-login', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password !== process.env.ADMIN_MASTER_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid master password'
      });
    }

    // Create or get admin user
    let admin = await User.findOne({ email: 'admin@ybdigital.com' });
    
    if (!admin) {
      admin = new User({
        name: 'YB Digital Admin',
        email: 'admin@ybdigital.com',
        password: await bcrypt.hash(process.env.ADMIN_MASTER_PASSWORD, 10),
        role: 'admin',
        isActive: true,
      });
      await admin.save();
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Admin login successful',
      user: admin,
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin login'
    });
  }
});

// Member Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address, department, position } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      phone,
      address,
      department,
      position,
      role: 'member'
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// Member Login
router.post('/member-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.'
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    console.error('Member login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Verify Token
router.get('/verify', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Token is valid',
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;
