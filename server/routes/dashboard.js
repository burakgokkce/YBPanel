const express = require('express');
const User = require('../models/User');
const Task = require('../models/Task');
const Announcement = require('../models/Announcement');
const Meeting = require('../models/Meeting');
const { auth, adminAuth, projectManagerAuth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard stats (Admin and Project Manager)
router.get('/stats', projectManagerAuth, async (req, res) => {
  try {
    const [
      totalMembers,
      activeMembers,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalAnnouncements,
      upcomingMeetings
    ] = await Promise.all([
      User.countDocuments({ role: 'member' }),
      User.countDocuments({ role: 'member', isActive: true }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'pending' }),
      Announcement.countDocuments(),
      Meeting.countDocuments({ date: { $gte: new Date() } })
    ]);

    const stats = {
      totalMembers,
      activeMembers,
      totalTasks,
      completedTasks,
      pendingTasks,
      totalAnnouncements,
      upcomingMeetings
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

// Get member dashboard data
router.get('/member', auth, async (req, res) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Member access required.'
      });
    }

    const userId = req.user._id;

    // Get member's tasks
    const myTasks = await Task.find({ 
      assignedTo: userId 
    }).sort({ createdAt: -1 }).limit(5);

    // Get team tasks
    const teamTasks = await Task.find({ 
      team: { $exists: true, $ne: null, $ne: '' }
    }).sort({ createdAt: -1 }).limit(5);

    // Get recent announcements
    const announcements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Get upcoming meetings
    const upcomingMeetings = await Meeting.find({ 
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(5);

    // Get task counts for member
    const [myTasksCount, completedTasksCount] = await Promise.all([
      Task.countDocuments({ assignedTo: userId }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' })
    ]);

    const dashboardData = {
      profile: req.user,
      myTasks,
      teamTasks,
      announcements,
      upcomingMeetings,
      stats: {
        myTasksCount,
        completedTasksCount,
        pendingTasksCount: myTasksCount - completedTasksCount
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Get member dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching member dashboard'
    });
  }
});

// Get recent activities (Admin and Project Manager)
router.get('/activities', projectManagerAuth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get recent users
    const recentUsers = await User.find({ role: 'member' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    // Get recent tasks
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt createdByName');

    // Get recent announcements
    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title createdAt createdByName');

    const activities = {
      recentUsers,
      recentTasks,
      recentAnnouncements
    };

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activities'
    });
  }
});

module.exports = router;
