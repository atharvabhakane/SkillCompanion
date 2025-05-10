const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const analysisController = require('../controllers/analysisController');
const userController = require('../controllers/userController');
const router = express.Router();

// Public routes (no auth required)
router.get('/public/required-skills/:targetRole', analysisController.getRequiredSkillsForRole);

// Protected routes - Apply auth middleware to all routes below this line
router.use(authMiddleware);

// Get user profile
router.get('/profile', userController.getUserProfile);

// Update user profile
router.put('/profile', userController.updateUserProfile);

// Update a single skill or add new one
router.patch('/skills', userController.updateSkillProgress);

// Skill gap analysis
router.get('/analysis/skill-gap', analysisController.getSkillGapAnalysis);

module.exports = router; 