const express = require('express');
const router = express.Router();
const learningResourcesController = require('../controllers/learningResourcesController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Test route to check if the API is working
router.get('/test', (req, res) => {
  res.status(200).json({ success: true, message: 'Learning resources API is working' });
});

// GET Python resources specifically - guaranteed to work without API
router.get('/python', (req, res) => {
  // Return hardcoded Python resources that are guaranteed to work
  const pythonResources = [
    {
      title: "Python for Beginners - Full Course",
      url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
      author: "freeCodeCamp",
      description: "Learn Python basics in this comprehensive course for beginners.",
      thumbnail: "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg",
      type: "video",
      formattedViews: "4.5M+",
      formattedDuration: "4:26:51",
      qualityIndicator: "Highly Recommended"
    },
    {
      title: "Python Tutorial - Python Full Course for Beginners",
      url: "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
      author: "Programming with Mosh",
      description: "Python tutorial for beginners - Learn Python for machine learning and web development.",
      thumbnail: "https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg",
      type: "video",
      formattedViews: "23M+",
      formattedDuration: "6:14:07",
      qualityIndicator: "Highly Recommended"
    },
    {
      title: "Python Crash Course For Beginners",
      url: "https://www.youtube.com/watch?v=JJmcL1N2KQs",
      author: "Traversy Media",
      description: "Learn Python fundamentals in this crash course covering variables, loops, functions, and more.",
      thumbnail: "https://i.ytimg.com/vi/JJmcL1N2KQs/hqdefault.jpg",
      type: "video",
      formattedViews: "1.9M+",
      formattedDuration: "1:32:25",
      qualityIndicator: "Recommended"
    },
    {
      title: "Python for Data Science - Course for Beginners",
      url: "https://www.youtube.com/watch?v=LHBE6Q9XlzI",
      author: "freeCodeCamp",
      description: "Learn Python for data science including NumPy, Pandas, Matplotlib and more.",
      thumbnail: "https://i.ytimg.com/vi/LHBE6Q9XlzI/hqdefault.jpg",
      type: "video",
      formattedViews: "2.3M+",
      formattedDuration: "5:12:49",
      qualityIndicator: "Highly Recommended"
    },
    {
      title: "Python Documentation",
      url: "https://docs.python.org/3/",
      author: "Python.org",
      description: "Official Python documentation with tutorials, library references, and language syntax.",
      thumbnail: "https://www.python.org/static/opengraph-icon-200x200.png",
      type: "documentation",
      qualityIndicator: "Essential"
    }
  ];

  res.status(200).json({
    success: true,
    count: pythonResources.length,
    data: pythonResources
  });
});

// GET learning resources for a specific role
router.get('/role/:targetRole', (req, res) => {
  try {
    learningResourcesController.getResourcesForRole(req, res);
  } catch (error) {
    console.error('Route error in getResourcesForRole:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when fetching role resources',
      error: error.message
    });
  }
});

// GET learning resources for a specific skill
router.get('/skill/:skillName', (req, res) => {
  try {
    learningResourcesController.getResourcesForSkill(req, res);
  } catch (error) {
    console.error('Route error in getResourcesForSkill:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when fetching skill resources',
      error: error.message
    });
  }
});

// GET search learning resources
router.get('/search', (req, res) => {
  try {
    learningResourcesController.searchResources(req, res);
  } catch (error) {
    console.error('Route error in searchResources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error when searching resources',
      error: error.message
    });
  }
});

module.exports = router; 