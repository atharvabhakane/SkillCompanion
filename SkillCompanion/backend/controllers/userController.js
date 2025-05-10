const User = require('../models/User');

// Update user profile with skills and target role
exports.updateUserProfile = async (req, res) => {
  try {
    const { existingSkills, targetRole } = req.body;
    const userId = req.user.userId; // From auth middleware
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Update user profile
    if (existingSkills) {
      user.existingSkills = existingSkills.map(skill => ({
        skillName: skill.skillName,
        proficiency: skill.proficiency || 'Beginner',
        status: skill.status || 'Not Started',
        startDate: skill.startDate || null,
        completionDate: skill.completionDate || null,
        notes: skill.notes || ''
      }));
    }
    
    if (targetRole) {
      user.targetRole = targetRole;
    }
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update skill progress
exports.updateSkillProgress = async (req, res) => {
  try {
    const { skillName, proficiency, status, notes } = req.body;
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    // Find the skill in user's existing skills
    const skillIndex = user.existingSkills.findIndex(
      skill => skill.skillName.toLowerCase() === skillName.toLowerCase()
    );
    
    if (skillIndex === -1) {
      // Skill not found, add new skill
      user.existingSkills.push({
        skillName,
        proficiency: proficiency || 'Beginner',
        status: status || 'Not Started',
        startDate: new Date(),
        notes: notes || ''
      });
    } else {
      // Update existing skill
      if (proficiency) {
        user.existingSkills[skillIndex].proficiency = proficiency;
      }
      
      if (status) {
        user.existingSkills[skillIndex].status = status;
        
        // Update dates based on status
        if (status === 'In Progress' && !user.existingSkills[skillIndex].startDate) {
          user.existingSkills[skillIndex].startDate = new Date();
        } else if (status === 'Completed') {
          user.existingSkills[skillIndex].completionDate = new Date();
        }
      }
      
      if (notes) {
        user.existingSkills[skillIndex].notes = notes;
      }
    }
    
    await user.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        skill: user.existingSkills.find(
          skill => skill.skillName.toLowerCase() === skillName.toLowerCase()
        )
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
}; 