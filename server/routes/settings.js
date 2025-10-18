const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory storage for settings (you can use database for production)
let appSettings = {
  language: 'tr',
  departments: [
    'iOS',
    'Android', 
    'Backend',
    'Web',
    'Mobil',
    'Tasarım',
    'Test',
    'Proje Yönetimi',
    'Yönetim'
  ]
};

// Get settings
router.get('/', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: appSettings
    });
  } catch (error) {
    console.error('Settings get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings'
    });
  }
});

// Update settings
router.put('/', auth, async (req, res) => {
  try {
    const { language, departments } = req.body;

    if (language) {
      appSettings.language = language;
    }

    if (departments && Array.isArray(departments)) {
      appSettings.departments = departments;
    }

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: appSettings
    });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings'
    });
  }
});

// Get departments only
router.get('/departments', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: appSettings.departments
    });
  } catch (error) {
    console.error('Departments get error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get departments'
    });
  }
});

module.exports = router;
