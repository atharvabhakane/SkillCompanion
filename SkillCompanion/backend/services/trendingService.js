const sheetsService = require('./sheetsService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Get trending skills analysis
const getTrendingSkills = async () => {
  try {
    let skills = await sheetsService.getSkillsData();
    
    // If no skills data is found, use fallback mock data
    if (!skills || skills.length === 0) {
      console.log('No skills data found, using fallback mock data');
      skills = [
        {
          skillId: 'S001',
          skillName: 'React.js',
          category: 'Frontend Development',
          demandLevel: 'Very High',
          growthRate: 'Rapid',
          averageSalary: '$110,000'
        },
        {
          skillId: 'S002',
          skillName: 'Python',
          category: 'Programming Languages',
          demandLevel: 'Very High',
          growthRate: 'Rapid',
          averageSalary: '$120,000'
        },
        {
          skillId: 'S003',
          skillName: 'Data Science',
          category: 'Data',
          demandLevel: 'High',
          growthRate: 'Rapid',
          averageSalary: '$130,000'
        },
        {
          skillId: 'S004',
          skillName: 'Cloud Architecture',
          category: 'Cloud Computing',
          demandLevel: 'Very High',
          growthRate: 'Rapid',
          averageSalary: '$150,000'
        },
        {
          skillId: 'S005',
          skillName: 'DevOps',
          category: 'DevOps',
          demandLevel: 'High',
          growthRate: 'Rapid',
          averageSalary: '$125,000'
        },
        {
          skillId: 'S006',
          skillName: 'TypeScript',
          category: 'Programming Languages',
          demandLevel: 'High',
          growthRate: 'Rapid',
          averageSalary: '$115,000'
        },
        {
          skillId: 'S007',
          skillName: 'Node.js',
          category: 'Backend Development',
          demandLevel: 'High',
          growthRate: 'Steady',
          averageSalary: '$105,000'
        }
      ];
    }
    
    // Get high demand skills
    const highDemandSkills = skills.filter(skill => 
      ['High', 'Very High'].includes(skill.demandLevel)
    );
    
    // Get rapid growth skills
    const rapidGrowthSkills = skills.filter(skill => 
      skill.growthRate === 'Rapid'
    );
    
    // Get skills with high salary
    const highSalarySkills = skills.sort((a, b) => {
      const salaryA = parseInt(a.averageSalary?.replace(/[^0-9]/g, '') || '0');
      const salaryB = parseInt(b.averageSalary?.replace(/[^0-9]/g, '') || '0');
      return salaryB - salaryA;
    }).slice(0, 10);
    
    // Get skills by category
    const categories = [...new Set(skills.map(skill => skill.category))];
    const skillsByCategory = {};
    
    categories.forEach(category => {
      skillsByCategory[category] = skills.filter(skill => 
        skill.category === category
      ).sort((a, b) => {
        const demandOrder = { 'Very High': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (demandOrder[b.demandLevel] || 0) - (demandOrder[a.demandLevel] || 0);
      }).slice(0, 5); // Top 5 skills per category
    });
    
    return {
      topDemandSkills: highDemandSkills.slice(0, 10),
      topGrowthSkills: rapidGrowthSkills.slice(0, 10),
      topSalarySkills: highSalarySkills,
      skillsByCategory
    };
  } catch (error) {
    console.error('Trending skills analysis error:', error);
    throw error;
  }
};

// Get trending tools analysis
const getTrendingTools = async () => {
  try {
    let tools = await sheetsService.getToolsData();
    
    // If no tools data is found, use fallback mock data
    if (!tools || tools.length === 0) {
      console.log('No tools data found, using fallback mock data');
      tools = [
        {
          toolId: 'T001',
          toolName: 'Visual Studio Code',
          category: 'Development Tools',
          primaryUseCases: 'Code editing, debugging, and version control integration',
          skillLevelRequired: 'Beginner',
          growthTrend: 'Rapidly Growing'
        },
        {
          toolId: 'T002',
          toolName: 'Docker',
          category: 'DevOps',
          primaryUseCases: 'Containerization and deployment',
          skillLevelRequired: 'Intermediate',
          growthTrend: 'Rapidly Growing'
        },
        {
          toolId: 'T003',
          toolName: 'TensorFlow',
          category: 'AI/ML',
          primaryUseCases: 'Building and training machine learning models',
          skillLevelRequired: 'Advanced',
          growthTrend: 'Growing'
        },
        {
          toolId: 'T004',
          toolName: 'React DevTools',
          category: 'Development Tools',
          primaryUseCases: 'Debugging and profiling React applications',
          skillLevelRequired: 'Intermediate',
          growthTrend: 'Growing'
        },
        {
          toolId: 'T005',
          toolName: 'Kubernetes',
          category: 'DevOps',
          primaryUseCases: 'Container orchestration and scaling',
          skillLevelRequired: 'Advanced',
          growthTrend: 'Rapidly Growing'
        },
        {
          toolId: 'T006',
          toolName: 'GitHub Copilot',
          category: 'AI Tools',
          primaryUseCases: 'AI-assisted code generation',
          skillLevelRequired: 'Beginner',
          growthTrend: 'Rapidly Growing'
        }
      ];
    }
    
    // Get growing tools
    const growingTools = tools.filter(tool => 
      ['Growing', 'Rapidly Growing'].includes(tool.growthTrend)
    );
    
    // Get tools by category
    const categories = [...new Set(tools.map(tool => tool.category))];
    const toolsByCategory = {};
    
    categories.forEach(category => {
      toolsByCategory[category] = tools.filter(tool => 
        tool.category === category
      ).sort((a, b) => {
        const growthOrder = { 'Rapidly Growing': 3, 'Growing': 2, 'Stable': 1, 'Declining': 0 };
        return (growthOrder[b.growthTrend] || 0) - (growthOrder[a.growthTrend] || 0);
      }).slice(0, 5); // Top 5 tools per category
    });
    
    return {
      topGrowthTools: growingTools.slice(0, 10),
      toolsByCategory
    };
  } catch (error) {
    console.error('Trending tools analysis error:', error);
    throw error;
  }
};

// Get enhanced trends analysis using Gemini API
const getEnhancedTrendsAnalysis = async () => {
  try {
    const skills = await sheetsService.getSkillsData();
    const tools = await sheetsService.getToolsData();
    
    // Prepare data for Gemini
    const highDemandSkills = skills
      .filter(skill => ['High', 'Very High'].includes(skill.demandLevel))
      .slice(0, 10)
      .map(skill => skill.skillName);
    
    const rapidGrowthSkills = skills
      .filter(skill => skill.growthRate === 'Rapid')
      .slice(0, 10)
      .map(skill => skill.skillName);
    
    const growingTools = tools
      .filter(tool => ['Growing', 'Rapidly Growing'].includes(tool.growthTrend))
      .slice(0, 10)
      .map(tool => tool.toolName);
    
    const prompt = `
    I'm analyzing tech industry trends based on the following data:
    
    Top in-demand skills: ${highDemandSkills.join(', ')}
    
    Fastest growing skills: ${rapidGrowthSkills.join(', ')}
    
    Trending tools and technologies: ${growingTools.join(', ')}
    
    Please provide:
    1. A brief analysis of current industry trends based on this data
    2. Insights into what these trends suggest about the future job market
    3. Recommendations for professionals looking to stay relevant
    
    Keep your response under 500 words and focus on practical insights.
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
## Industry Trends Analysis

Based on the skills and tools data, we can observe several key trends in the tech industry:

### Current Industry Trends
The most in-demand skills are centered around ${highDemandSkills.slice(0, 3).join(', ')}, indicating a strong market focus on these technologies. Meanwhile, rapid growth in ${rapidGrowthSkills.slice(0, 3).join(', ')} suggests emerging areas that companies are investing in.

The trending tools like ${growingTools.slice(0, 3).join(', ')} complement these skill areas and point to industry standardization around certain technology stacks.

### Future Job Market Implications
The job market is likely to prioritize candidates with expertise in the high-demand skills, while those who can demonstrate proficiency in rapidly growing areas will be positioned for emerging opportunities. We can expect increasing specialization in these domains as they mature.

The convergence of these skills and tools indicates that professionals who can bridge multiple technology areas will be particularly valuable as companies seek to integrate these solutions.

### Recommendations for Professionals
1. Focus on developing expertise in at least one high-demand skill while gaining familiarity with complementary rapidly growing skills
2. Become proficient with the trending tools that align with your skill areas
3. Stay informed about how these technologies are being applied in real-world scenarios
4. Consider building projects that demonstrate your ability to integrate multiple in-demand technologies
5. Join communities and contribute to open-source projects related to these skills to build your network and visibility

By strategically investing your learning time in these areas, you'll be well-positioned to take advantage of current and emerging opportunities in the tech job market.
      `;
    }
  } catch (error) {
    console.error('Enhanced trends analysis error:', error);
    return "We couldn't generate an enhanced trends analysis at this time. Please try again later.";
  }
};

module.exports = {
  getTrendingSkills,
  getTrendingTools,
  getEnhancedTrendsAnalysis
}; 