const express = require('express');
const trendingController = require('../controllers/trendingController');
const router = express.Router();

router.get('/skills', trendingController.getTrendingSkills);
router.get('/tools', trendingController.getTrendingTools);
router.get('/enhanced-analysis', trendingController.getEnhancedTrendsAnalysis);

// New visualization endpoints
router.get('/skill-trends', trendingController.getSkillTrendsData);
router.get('/skill-gap', trendingController.getSkillGapData);
router.get('/regional-skill', trendingController.getRegionalSkillData);

module.exports = router; 