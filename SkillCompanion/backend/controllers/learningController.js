const youtubeService = require('../services/youtubeService');
const geminiService = require('../services/geminiService');

/**
 * Get learning resources for a target role
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRoleResources = async (req, res) => {
  try {
    const { targetRole } = req.params;
    
    if (!targetRole) {
      return res.status(400).json({
        status: 'fail',
        message: 'Target role is required'
      });
    }
    
    const resources = youtubeService.getRecommendationsForRole(targetRole);
    
    res.status(200).json({
      status: 'success',
      results: resources.length,
      data: {
        targetRole,
        resources
      }
    });
  } catch (error) {
    console.error('Error fetching resources for role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

/**
 * Get learning resources for a skill
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSkillResources = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!skillName) {
      return res.status(400).json({
        status: 'fail',
        message: 'Skill name is required'
      });
    }
    
    const resources = youtubeService.getRecommendationsForSkill(skillName);
    
    res.status(200).json({
      status: 'success',
      results: resources.length,
      data: {
        skillName,
        resources
      }
    });
  } catch (error) {
    console.error('Error fetching resources for skill:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

/**
 * Generate AI-powered learning resource recommendations when none exist
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateSkillResources = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }
    
    // First try to get recommendations from YouTube API
    const resources = await youtubeService.getRecommendationsForSkill(skillName);
    
    // If we have results, return them
    if (resources && resources.length > 0) {
      return res.status(200).json({
        success: true,
        count: resources.length,
        data: resources,
        source: 'youtube'
      });
    }
    
    // Fallback to dynamic resources if no API results
    const dynamicResources = youtubeService.generateDynamicResources(skillName);
    
    return res.status(200).json({
      success: true,
      count: dynamicResources.length,
      data: dynamicResources,
      source: 'generated'
    });
  } catch (error) {
    console.error('Error generating resources for skill:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate learning resources',
      error: error.message
    });
  }
}; 