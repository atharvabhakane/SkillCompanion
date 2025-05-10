const express = require('express');
const skillController = require('../controllers/skillController');
const toolController = require('../controllers/toolController');
const router = express.Router();

// Skills routes
router.get('/skills', skillController.getAllSkills);
router.get('/skills/category/:category', skillController.getSkillsByCategory);
router.get('/skills/demand/:level', skillController.getSkillsByDemand);

// Tools routes
router.get('/tools', toolController.getAllTools);
router.get('/tools/category/:category', toolController.getToolsByCategory);

module.exports = router; 