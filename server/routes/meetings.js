const express = require('express');
const Meeting = require('../models/Meeting');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all meetings
router.get('/', auth, async (req, res) => {
  try {
    const { upcoming, limit = 10 } = req.query;
    let query = {};

    // Filter for upcoming meetings
    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
    }

    const meetings = await Meeting.find(query)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: meetings
    });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meetings'
    });
  }
});

// Get meeting by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email');
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching meeting'
    });
  }
});

// Create meeting (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, date, time, link, notes, attendees } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Title, date, and time are required'
      });
    }

    const meeting = new Meeting({
      title,
      description,
      date: new Date(date),
      time,
      link,
      notes,
      attendees: attendees || [],
      createdBy: req.user._id,
      createdByName: req.user.name
    });

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: populatedMeeting
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating meeting'
    });
  }
});

// Update meeting (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { title, description, date, time, link, notes, attendees } = req.body;
    
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    if (title) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (date) meeting.date = new Date(date);
    if (time) meeting.time = time;
    if (link !== undefined) meeting.link = link;
    if (notes !== undefined) meeting.notes = notes;
    if (attendees !== undefined) meeting.attendees = attendees;

    await meeting.save();

    const populatedMeeting = await Meeting.findById(meeting._id)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Meeting updated successfully',
      data: populatedMeeting
    });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating meeting'
    });
  }
});

// Delete meeting (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting meeting'
    });
  }
});

module.exports = router;
