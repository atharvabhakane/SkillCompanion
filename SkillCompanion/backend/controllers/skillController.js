const sheetsService = require('../services/sheetsService');

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await sheetsService.getSkillsData();
    
    res.status(200).json({
      status: 'success',
      results: skills.length,
      data: {
        skills
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skills data',
      error: error.message
    });
  }
};

// Get skills by category
exports.getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const skills = await sheetsService.getSkillsData();
    
    const filteredSkills = skills.filter(
      skill => skill.category.toLowerCase() === category.toLowerCase()
    );
    
    res.status(200).json({
      status: 'success',
      results: filteredSkills.length,
      data: {
        skills: filteredSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skills by category',
      error: error.message
    });
  }
};

// Get skills by demand level
exports.getSkillsByDemand = async (req, res) => {
  try {
    const { level } = req.params;
    const skills = await sheetsService.getSkillsData();
    
    const filteredSkills = skills.filter(
      skill => skill.demandLevel.toLowerCase() === level.toLowerCase()
    );
    
    res.status(200).json({
      status: 'success',
      results: filteredSkills.length,
      data: {
        skills: filteredSkills
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch skills by demand level',
      error: error.message
    });
  }
}; 