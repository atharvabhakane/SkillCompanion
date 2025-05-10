const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require('firebase/auth');

// Hardcoded admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'thisisadmin';

// @desc    Login admin
// @route   POST /api/admin/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password',
      });
    }

    // Check if credentials match hardcoded admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials',
      });
    }

    // Find admin by email or create one if it doesn't exist
    let admin = await Admin.findOne({ email });

    if (!admin) {
      // Create a new Firebase user for admin
      const auth = getAuth();
      try {
        // Try to create user in Firebase
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUid = userCredential.user.uid;

        // Create admin in database
        admin = await Admin.create({
          email,
          firebaseUid,
          role: 'admin'
        });
      } catch (firebaseError) {
        // If user already exists in Firebase, try to sign in
        if (firebaseError.code === 'auth/email-already-in-use') {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUid = userCredential.user.uid;
          
          admin = await Admin.create({
            email,
            firebaseUid,
            role: 'admin'
          });
        } else {
          throw firebaseError;
        }
      }
    }

    // Create token
    const token = jwt.sign(
      { adminId: admin._id, email: admin.email, role: admin.role },
      process.env.ADMIN_JWT_SECRET || 'admin-secret-key-fallback',
      { expiresIn: '1d' }
    );

    // Send token to client
    res.status(200).json({
      status: 'success',
      token,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during login',
    });
  }
};

// @desc    Verify admin token
// @route   GET /api/admin/verify
// @access  Private (Admin only)
exports.verifyToken = async (req, res) => {
  try {
    // If middleware passed, admin exists
    const admin = await Admin.findById(req.admin.adminId);
    
    if (!admin) {
      return res.status(404).json({
        status: 'fail',
        message: 'Admin not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          role: admin.role
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error during token verification'
    });
  }
}; 