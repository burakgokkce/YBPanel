const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  assignedToNames: [{
    type: String,
  }],
  team: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['beklemede', 'devam_ediyor', 'tamamlandi', 'iptal_edildi'],
    default: 'beklemede'
  },
  priority: {
    type: String,
    enum: ['dusuk', 'orta', 'yuksek', 'acil'],
    default: 'orta'
  },
  dueDate: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Task', taskSchema);
