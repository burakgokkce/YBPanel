const express = require('express');
const mongoose = require('mongoose');
const { auth, adminAuth, projectManagerAuth } = require('../middleware/auth');

const router = express.Router();

// User Report Schema
const userReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['günlük', 'haftalık', 'aylık', 'proje', 'sorun', 'öneri', 'diğer'],
    default: 'günlük'
  },
  priority: {
    type: String,
    enum: ['düşük', 'orta', 'yüksek', 'kritik'],
    default: 'orta'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  authorRole: {
    type: String,
    required: true
  },
  department: {
    type: String
  },
  status: {
    type: String,
    enum: ['beklemede', 'inceleniyor', 'tamamlandı', 'reddedildi'],
    default: 'beklemede'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UserReport = mongoose.model('UserReport', userReportSchema);

// Get all reports (Admin and Project Manager only)
router.get('/', projectManagerAuth, async (req, res) => {
  try {
    const { status, category, author, priority } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (author && author !== 'all') {
      query.author = author;
    }
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    const reports = await UserReport.find(query)
      .populate('author', 'firstName lastName email department')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Raporlar yüklenemedi'
    });
  }
});

// Get user's own reports
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await UserReport.find({ author: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Raporlarınız yüklenemedi'
    });
  }
});

// Create new report (All authenticated users)
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, priority } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Başlık ve içerik zorunludur'
      });
    }

    const report = new UserReport({
      title,
      content,
      category: category || 'günlük',
      priority: priority || 'orta',
      author: req.user._id,
      authorName: req.user.firstName + ' ' + req.user.lastName,
      authorRole: req.user.role,
      department: req.user.department
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Rapor başarıyla oluşturuldu',
      data: report
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor oluşturulamadı'
    });
  }
});

// Update report status and admin notes (Admin and Project Manager only)
router.put('/:id', projectManagerAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const report = await UserReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.updatedAt = new Date();

    await report.save();

    res.json({
      success: true,
      message: 'Rapor güncellendi',
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor güncellenemedi'
    });
  }
});

// Delete report (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const report = await UserReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }

    await UserReport.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Rapor silindi'
    });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor silinemedi'
    });
  }
});

module.exports = router;
