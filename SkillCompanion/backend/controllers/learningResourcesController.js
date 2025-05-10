const youtubeService = require('../services/youtubeService');

/**
 * Get learning resources for a specific role
 * @param {Object} req - Express request object with targetRole parameter
 * @param {Object} res - Express response object
 */
const getResourcesForRole = async (req, res) => {
  try {
    const { targetRole } = req.params;
    
    if (!targetRole) {
      return res.status(400).json({
        success: false,
        message: 'Target role is required'
      });
    }
    
    try {
      // Fetch resources for the specified role
      const resources = await youtubeService.getRecommendationsForRole(targetRole);
      
      if (!resources || resources.length === 0) {
        // Provide default resources if none found
        const defaultResources = await youtubeService.getRecommendationsForRole('Full Stack Developer');
        
        return res.status(200).json({
          success: true,
          message: `No specific resources found for ${targetRole}, showing general recommendations`,
          data: youtubeService.labelResourcesBySource(defaultResources)
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Resources for ${targetRole} retrieved successfully`,
        data: resources
      });
    } catch (error) {
      console.error(`Error fetching resources for role ${targetRole}:`, error);
      
      // Fallback to mock data
      const defaultResources = await youtubeService.getRecommendationsForRole('Full Stack Developer');
      
      return res.status(200).json({
        success: true,
        message: 'Using default resources due to an error',
        data: youtubeService.labelResourcesBySource(defaultResources)
      });
    }
  } catch (error) {
    console.error('Error in getResourcesForRole controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

/**
 * Get learning resources for a specific skill
 * @param {Object} req - Express request object with skillName parameter
 * @param {Object} res - Express response object
 */
const getResourcesForSkill = async (req, res) => {
  try {
    const { skillName } = req.params;
    
    if (!skillName) {
      return res.status(400).json({
        success: false,
        message: 'Skill name is required'
      });
    }
    
    try {
      console.log(`Fetching resources for skill: ${skillName}`);
      
      // Use accurate skill search term for better results
      const normalizedSkill = skillName.trim();
      
      // Fetch both YouTube and Coursera resources together
      // Using the specific skill name as the search term
      const resources = await youtubeService.searchYouTube(normalizedSkill);
      
      if (!resources || resources.length === 0) {
        // Create specific query for the skill
        const specificQuery = `${normalizedSkill} tutorial beginner learn`;
        console.log(`No resources found with basic query, trying specific query: "${specificQuery}"`);
        
        // Try again with more specific search term
        const fallbackResources = await youtubeService.searchYouTube(specificQuery);
        
        if (!fallbackResources || fallbackResources.length === 0) {
          // No resources found, return a 404 instead of default resources
          return res.status(404).json({
            success: false,
            message: `No learning resources found for ${skillName}`
          });
        }
        
        // Label resources by source and return them
        return res.status(200).json({
          success: true,
          message: `Found resources for ${skillName} with specific query`,
          data: youtubeService.labelResourcesBySource(fallbackResources)
        });
      }
      
      // Group resources by source
      const groupedResources = {
        youtube: resources.filter(r => r.source === 'YouTube' || (!r.source && !r.type)),
        coursera: resources.filter(r => r.source === 'Coursera'),
        documentation: resources.filter(r => r.source === 'Documentation' || r.type === 'documentation')
      };
      
      return res.status(200).json({
        success: true,
        message: `Resources for ${skillName} retrieved successfully`,
        data: resources,
        groupedData: groupedResources
      });
    } catch (error) {
      console.error(`Error fetching resources for skill ${skillName}:`, error);
      
      // Return an error instead of default resources
      return res.status(500).json({
        success: false,
        message: `Failed to fetch resources for ${skillName}`,
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in getResourcesForSkill controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

/**
 * Search for learning resources
 * @param {Object} req - Express request object with q query parameter
 * @param {Object} res - Express response object
 */
const searchResources = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    try {
      // Search for resources across platforms
      const results = await youtubeService.searchYouTube(q);
      
      if (!results || results.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No resources found for your search'
        });
      }
      
      // Group results by source
      const groupedResults = {
        youtube: results.filter(r => r.source === 'YouTube' || !r.source),
        coursera: results.filter(r => r.source === 'Coursera'),
        documentation: results.filter(r => r.source === 'Documentation' || r.type === 'documentation')
      };
      
      return res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: results,
        groupedData: groupedResults
      });
    } catch (error) {
      console.error(`Error searching resources for "${q}":`, error);
      
      // Fallback to JavaScript resources
      const defaultResources = await youtubeService.getRecommendationsForSkill('JavaScript');
      
      return res.status(200).json({
        success: true,
        message: 'Using default resources due to an error',
        data: youtubeService.labelResourcesBySource(defaultResources)
      });
    }
  } catch (error) {
    console.error('Error in searchResources controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to search learning resources',
      error: error.message
    });
  }
};

module.exports = {
  getResourcesForRole,
  getResourcesForSkill,
  searchResources
}; 