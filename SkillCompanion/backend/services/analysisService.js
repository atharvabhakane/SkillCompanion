const sheetsService = require('./sheetsService');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const geminiService = require('./geminiService');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Perform skill gap analysis
const performSkillGapAnalysis = async (userSkills, targetRole) => {
  try {
    // Get required skills using Gemini API based on the target role
    let requiredSkills = await geminiService.generateRequiredSkillsForRole(targetRole);
    
    // If no skills found from Gemini (error case), fallback to sheet data
    if (!requiredSkills || requiredSkills.length === 0) {
      console.log('No skills returned from Gemini, falling back to sheets data');
      // Get all skills data from sheet
      const allSkills = await sheetsService.getSkillsData();
      
      // Filter skills relevant to the target role
      const roleSkills = allSkills.filter(skill => 
        skill.skillName.toLowerCase().includes(targetRole.toLowerCase()) ||
        skill.category.toLowerCase().includes(targetRole.toLowerCase())
      );
      
      // If no skills found for role, get high demand skills as fallback
      requiredSkills = roleSkills.length > 0 
        ? roleSkills 
        : allSkills.filter(skill => 
            ['High', 'Very High'].includes(skill.demandLevel)
          );
    } else {
      console.log(`Found ${requiredSkills.length} required skills from Gemini for role: ${targetRole}`);
    }
    
    // Extract user skill names for easy comparison
    const userSkillNames = userSkills.map(skill => skill.skillName.toLowerCase());
    
    // Find missing skills
    const missingSkills = requiredSkills.filter(
      skill => !userSkillNames.includes(skill.skillName.toLowerCase())
    );
    
    // Find skills to improve (user has them but might need to upgrade proficiency)
    const skillsToImprove = requiredSkills.filter(requiredSkill => {
      const matchingUserSkill = userSkills.find(
        userSkill => userSkill.skillName.toLowerCase() === requiredSkill.skillName.toLowerCase()
      );
      
      return matchingUserSkill && matchingUserSkill.proficiency !== 'Advanced';
    });
    
    // Prepare recommendations based on importance
    const recommendations = [...missingSkills, ...skillsToImprove].sort((a, b) => {
      // Sort by importance first
      const importanceOrder = { 'Essential': 3, 'Important': 2, 'Helpful': 1 };
      const importanceDiff = (importanceOrder[b.importance] || 0) - (importanceOrder[a.importance] || 0);
      
      if (importanceDiff !== 0) return importanceDiff;
      
      // Then by learning time (prioritize quicker wins)
      const timeA = a.learningTimeMonths || 0;
      const timeB = b.learningTimeMonths || 0;
      
      return timeA - timeB;
    });
    
    return {
      userSkills,
      missingSkills,
      skillsToImprove,
      recommendations: recommendations.slice(0, 10) // Top 10 recommendations
    };
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    throw error;
  }
};

// Enhanced analysis using Gemini API
const getEnhancedAnalysis = async (analysisResults, targetRole) => {
  try {
    // Construct a list of missing skills with importance and learning time
    const missingSkillDetails = analysisResults.missingSkills.map(skill => 
      `${skill.skillName} (${skill.importance || 'Important'}, ~${skill.learningTimeMonths || '2-3'} months to learn)`
    ).join('\n- ');
    
    // Construct a list of skills to improve with current proficiency
    const improvementSkillDetails = analysisResults.skillsToImprove.map(skill => {
      const userSkill = analysisResults.userSkills.find(
        us => us.skillName.toLowerCase() === skill.skillName.toLowerCase()
      );
      return `${skill.skillName} (Current: ${userSkill?.proficiency || 'Beginner'}, Target: Advanced)`;
    }).join('\n- ');
    
    const prompt = `
    As a career advisor specializing in tech careers, I need to provide a detailed skill gap analysis for someone targeting a "${targetRole}" role.
    
    Their existing skills:
    - ${analysisResults.userSkills.map(s => s.skillName).join('\n- ')}
    
    Key missing skills they need to learn:
    - ${missingSkillDetails || 'No critical missing skills identified.'}
    
    Skills they should improve from current level:
    - ${improvementSkillDetails || 'No skills identified for improvement.'}
    
    Please provide:
    1. An assessment of their current skill profile compared to what's needed for a ${targetRole} position
    2. A personalized learning path with clear prioritization and timeline (what to learn first, second, etc.)
    3. Specific resources or certification recommendations for the highest priority skills
    4. Career development advice for breaking into or advancing in this role
    
    Make your response specific to the ${targetRole} position and the current job market.
    Keep your response under 500 words and focused on actionable, practical advice.
    `;
    
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const enhancedAnalysis = response.text();
      return enhancedAnalysis;
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Fallback response when Gemini API is not available
      return `
## Skill Gap Analysis for ${targetRole}

Based on your current skills and target role as a ${targetRole}, here's my analysis:

### Current Skill Assessment
Your skill profile shows some foundations, but there are several key areas to develop for this specific role.

### Recommended Learning Path
1. **Essential Skills (1-3 months):**
   ${analysisResults.missingSkills.slice(0, 3).map(s => `- ${s.skillName}`).join('\n   ')}

2. **Important Skills (3-6 months):**
   ${analysisResults.missingSkills.slice(3, 6).map(s => `- ${s.skillName}`).join('\n   ')}

3. **Complementary Skills (6+ months):**
   ${analysisResults.missingSkills.slice(6, 9).map(s => `- ${s.skillName}`).join('\n   ')}

Focus on high-priority skills first as they'll provide the most immediate value to employers. Consider enhancing your existing skills to advanced levels while gradually acquiring new ones.

### Career Development Advice
For ${targetRole} positions, seek projects that allow you to apply these skills in real-world scenarios. Build a portfolio demonstrating your capabilities, especially with the essential skills listed above. Consider joining communities related to ${targetRole} to stay current with industry trends.

This strategic approach will help you systematically close your skill gaps and position yourself competitively for ${targetRole} roles.
      `;
    }
  } catch (error) {
    console.error('Enhanced analysis error:', error);
    return "We couldn't generate an enhanced analysis at this time. Please try again later.";
  }
};

module.exports = {
  performSkillGapAnalysis,
  getEnhancedAnalysis
}; 