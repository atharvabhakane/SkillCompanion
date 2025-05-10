const express = require('express');
const contributionController = require('../controllers/contributionController');
const adminMiddleware = require('../middleware/adminMiddleware');
const router = express.Router();

// Public routes
router.post('/submit', contributionController.submitContribution);

// Admin routes
router.get('/pending', adminMiddleware, contributionController.getPendingContributions);
router.patch('/review/:contributionId', adminMiddleware, contributionController.reviewContribution);

// For testing purposes - temporary endpoint without admin middleware
router.get('/all', contributionController.getAllContributions);

module.exports = router; 