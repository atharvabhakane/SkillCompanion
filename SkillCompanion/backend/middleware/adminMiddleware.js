const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated. Please log in as admin.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with the same fallback as in adminController
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET || 'admin-secret-key-fallback');
    
    // Check if admin exists
    const admin = await Admin.findById(decoded.adminId);
    
    if (!admin) {
      return res.status(401).json({
        status: 'fail',
        message: 'Admin no longer exists'
      });
    }
    
    // Attach admin to request
    req.admin = decoded;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error.message);
    res.status(401).json({
      status: 'fail',
      message: 'Invalid token. Please log in again.'
    });
  }
}; 