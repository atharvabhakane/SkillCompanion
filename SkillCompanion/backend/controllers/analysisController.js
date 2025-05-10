const User = require('../models/User');
const analysisService = require('../services/analysisService');
const geminiService = require('../services/geminiService');

// Get skill gap analysis
exports.getSkillGapAnalysis = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    if (!user.targetRole) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please set a target role before requesting analysis'
      });
    }
    
    // Perform skill gap analysis
    const analysisResults = await analysisService.performSkillGapAnalysis(
      user.existingSkills,
      user.targetRole
    );
    
    // Get enhanced analysis using Gemini API
    const enhancedAnalysis = await analysisService.getEnhancedAnalysis(
      analysisResults,
      user.targetRole
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        targetRole: user.targetRole,
        userSkills: analysisResults.userSkills,
        missingSkills: analysisResults.missingSkills,
        skillsToImprove: analysisResults.skillsToImprove,
        recommendations: analysisResults.recommendations,
        enhancedAnalysis
      }
    });
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to perform skill gap analysis',
      error: error.message
    });
  }
};

/**
 * Get required skills for a target role using Gemini AI
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getRequiredSkillsForRole = async (req, res) => {
  try {
    const { targetRole } = req.params;
    
    if (!targetRole) {
      return res.status(400).json({
        status: 'fail',
        message: 'Target role is required'
      });
    }
    
    console.log(`Generating skills for target role: "${targetRole}"`);
    
    // Always trigger a fresh Gemini API call for each request
    // This ensures we get the most relevant skills for the specific role
    const skills = await geminiService.generateRequiredSkillsForRole(targetRole);
    
    if (!skills || skills.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'Could not generate skills for this role'
      });
    }
    
    res.status(200).json({
      status: 'success',
      results: skills.length,
      data: {
        targetRole,
        skills
      }
    });
  } catch (error) {
    console.error('Error fetching required skills for role:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch required skills',
      error: error.message
    });
  }
}; 