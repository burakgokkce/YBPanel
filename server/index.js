const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Set default environment variables if not provided
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27018/yb-digital-panel';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'yb-digital-panel-super-secret-jwt-key-2024';
process.env.ADMIN_MASTER_PASSWORD = process.env.ADMIN_MASTER_PASSWORD || 'yb150924';
process.env.PORT = process.env.PORT || '5002';

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27018/yb-digital-panel', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import models
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Task = require('./models/Task');
const Meeting = require('./models/Meeting');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'YB Digital Panel Server is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const announcementRoutes = require('./routes/announcements');
const taskRoutes = require('./routes/tasks');
const meetingRoutes = require('./routes/meetings');
const dashboardRoutes = require('./routes/dashboard');
const uploadRoutes = require('./routes/upload');
// const emailRoutes = require('./routes/email'); // Temporarily disabled
// const settingsRoutes = require('./routes/settings'); // Temporarily disabled

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
// app.use('/api/email', emailRoutes); // Temporarily disabled
// app.use('/api/settings', settingsRoutes); // Temporarily disabled

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'YB Digital Panel API is running!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
