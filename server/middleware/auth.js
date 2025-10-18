const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided, authorization denied' 
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'yb-digital-panel-super-secret-jwt-key-2024';
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid' 
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authorization failed' 
    });
  }
};

const projectManagerAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'project_manager') {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. Project manager or admin privileges required.' 
        });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Authorization failed' 
    });
  }
};

module.exports = { auth, adminAuth, projectManagerAuth };
