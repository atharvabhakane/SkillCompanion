const User = require('../models/User');
const { firebase } = require('../config/firebase');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({
      name,
      email
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google login
exports.googleLogin = async (req, res) => {
  try {
    const { email, username, firebaseUid } = req.body;
    
    if (!email || !firebaseUid) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and Firebase UID are required'
      });
    }
    
    // Check if user exists in MongoDB
    let user = await User.findOne({ firebaseUid });
    
    // If user doesn't exist, create new user
    if (!user) {
      // Check if username exists
      let finalUsername = username || email.split('@')[0];
      const existingUserWithUsername = await User.findOne({ username: finalUsername });
      
      // If username already exists, append a random string
      if (existingUserWithUsername) {
        const randomString = Math.random().toString(36).substring(2, 7);
        finalUsername = `${finalUsername}_${randomString}`;
      }
      
      user = new User({
        firebaseUid,
        email,
        username: finalUsername,
        existingSkills: [],
        targetRole: ''
      });
      
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      status: 'success',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
}; 