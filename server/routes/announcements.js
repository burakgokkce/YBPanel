const express = require('express');
const Announcement = require('../models/Announcement');
const { auth, adminAuth, projectManagerAuth } = require('../middleware/auth');

const router = express.Router();

// Get all announcements
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Announcement.countDocuments();

    res.json({
      success: true,
      data: announcements,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcements'
    });
  }
});

// Get announcement by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    res.json({
      success: true,
      data: announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching announcement'
    });
  }
});

// Create announcement (Admin and Project Manager)
router.post('/', projectManagerAuth, async (req, res) => {
  try {
    const { title, description, isImportant } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const announcement = new Announcement({
      title,
      description,
      isImportant: isImportant || false,
      createdBy: req.user._id,
      createdByName: req.user.name
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement created successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating announcement'
    });
  }
});

// Update announcement (Admin and Project Manager)
router.put('/:id', projectManagerAuth, async (req, res) => {
  try {
    const { title, description, isImportant } = req.body;
    
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    if (title) announcement.title = title;
    if (description) announcement.description = description;
    if (isImportant !== undefined) announcement.isImportant = isImportant;

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating announcement'
    });
  }
});

// Delete announcement (Admin and Project Manager)
router.delete('/:id', projectManagerAuth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found'
      });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully'
    });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting announcement'
    });
  }
});

module.exports = router;
