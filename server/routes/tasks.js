const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get tasks
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, team } = req.query;
    let query = {};

    // For members, only show tasks assigned to them or team tasks
    if (req.user.role === 'member') {
      query.$or = [
        { assignedTo: req.user._id },
        { team: { $exists: true, $ne: null } }
      ];
    }

    // Apply filters
    if (status && status !== 'all') {
      query.status = status;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }
    if (team && team !== 'all') {
      query.team = team;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tasks'
    });
  }
});

// Get task by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'member') {
      const isAssigned = task.assignedTo.some(user => user._id.toString() === req.user._id.toString());
      const isTeamTask = task.team && task.team !== '';
      
      if (!isAssigned && !isTeamTask) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching task'
    });
  }
});

// Create task (Admin only)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, description, assignedTo, team, priority, dueDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Get assigned user names
    let assignedToNames = [];
    if (assignedTo && assignedTo.length > 0) {
      const users = await User.find({ _id: { $in: assignedTo } });
      assignedToNames = users.map(user => user.name);
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignedTo || [],
      assignedToNames,
      team,
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user._id,
      createdByName: req.user.name
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating task'
    });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, assignedTo, team, status, priority, dueDate } = req.body;
    
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Members can only update status of their assigned tasks
    if (req.user.role === 'member') {
      const isAssigned = task.assignedTo.some(userId => userId.toString() === req.user._id.toString());
      const isTeamTask = task.team && task.team !== '';
      
      if (!isAssigned && !isTeamTask) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Members can only update status
      if (status && ['pending', 'in_progress', 'completed'].includes(status)) {
        task.status = status;
      }
    } else {
      // Admins can update all fields
      if (title) task.title = title;
      if (description) task.description = description;
      if (assignedTo !== undefined) {
        task.assignedTo = assignedTo;
        // Update assigned names
        if (assignedTo.length > 0) {
          const users = await User.find({ _id: { $in: assignedTo } });
          task.assignedToNames = users.map(user => user.name);
        } else {
          task.assignedToNames = [];
        }
      }
      if (team !== undefined) task.team = team;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating task'
    });
  }
});

// Delete task (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting task'
    });
  }
});

module.exports = router;
