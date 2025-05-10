const trendingService = require('../services/trendingService');
const skillTrendsService = require('../services/skillTrendsService');

// Get trending skills analysis
exports.getTrendingSkills = async (req, res) => {
  try {
    const trendingSkills = await trendingService.getTrendingSkills();
    
    res.status(200).json({
      status: 'success',
      data: {
        trendingSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending skills analysis',
      error: error.message
    });
  }
};

// Get trending tools analysis
exports.getTrendingTools = async (req, res) => {
  try {
    const trendingTools = await trendingService.getTrendingTools();
    
    res.status(200).json({
      status: 'success',
      data: {
        trendingTools
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending tools analysis',
      error: error.message
    });
  }
};

// Get enhanced trends analysis
exports.getEnhancedTrendsAnalysis = async (req, res) => {
  try {
    const enhancedAnalysis = await trendingService.getEnhancedTrendsAnalysis();
    
    res.status(200).json({
      status: 'success',
      data: {
        enhancedAnalysis
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch enhanced trends analysis',
      error: error.message
    });
  }
};

// Get skill trends data for visualizations
exports.getSkillTrendsData = async (req, res) => {
  try {
    const skillTrendsData = await skillTrendsService.getSkillTrendsData();
    
    res.status(200).json({
      status: 'success',
      data: {
        skillTrendsData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skill trends data',
      error: error.message
    });
  }
};

// Get skill gap data for radar charts
exports.getSkillGapData = async (req, res) => {
  try {
    const skillGapData = await skillTrendsService.getSkillGapData();
    
    res.status(200).json({
      status: 'success',
      data: {
        skillGapData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skill gap data',
      error: error.message
    });
  }
};

// Get regional skill data for heat maps
exports.getRegionalSkillData = async (req, res) => {
  try {
    const regionalSkillData = await skillTrendsService.getRegionalSkillData();
    
    res.status(200).json({
      status: 'success',
      data: {
        regionalSkillData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch regional skill data',
      error: error.message
    });
  }
}; 