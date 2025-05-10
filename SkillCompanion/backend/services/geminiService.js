const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API with a check for the API key
let genAI;
let model;

try {
  // Only initialize if the API key exists
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Update the model name to one that's available in the current API version
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    console.log('Gemini API initialized successfully with model: gemini-1.5-flash');
  } else {
    console.warn('GEMINI_API_KEY not set. Using mock model.');
    // Create a mock model for development
    model = {
      generateContent: async (prompt) => {
        console.log('Mock Gemini model called with prompt:', prompt.substring(0, 100) + '...');
        return {
          response: {
            text: () => '[]' // Return empty array as text
          }
        };
      }
    };
  }
} catch (error) {
  console.error('Error initializing Gemini:', error);
  // Fallback to mock model
  model = {
    generateContent: async (prompt) => {
      console.log('Mock Gemini model called with prompt:', prompt.substring(0, 100) + '...');
      return {
        response: {
          text: () => '[]' // Return empty array as text
        }
      };
    }
  };
}

// Enhance skill description
const enhanceSkillDescription = async (keywords, skillName, category) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return keywords; // Return original keywords if no API key
    }
    
    const prompt = `
    I need to create a professional description for a tech skill based on these keywords: "${keywords}"
    
    The skill name is: ${skillName}
    Category: ${category}
    
    Please create a concise, informative description (2-3 sentences) that explains what this skill is and why it's valuable in the industry.
    
    The description should be factual, clear, and helpful for someone learning about this skill.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for skill description:', error);
    return keywords; // Fallback to original keywords if enhancement fails
  }
};

// Enhance tool description
const enhanceToolDescription = async (keywords, toolName, category) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return keywords; // Return original keywords if no API key
    }
    
    const prompt = `
    I need to create a professional description for a tech tool based on these keywords: "${keywords}"
    
    The tool name is: ${toolName}
    Category: ${category}
    
    Please create a concise, informative description (2-3 sentences) that explains what this tool does and its primary use cases.
    
    The description should be factual, clear, and helpful for someone learning about this tool.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error for tool description:', error);
    return keywords; // Fallback to original keywords if enhancement fails
  }
};

/**
 * Generate a list of required skills for a target role
 * @param {string} targetRole - The role to generate skills for
 * @returns {Promise<Array>} - Array of required skills with details
 */
const generateRequiredSkillsForRole = async (targetRole) => {
  try {
    // Check if the API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.log('Gemini API key not configured, using fallback skills');
      return fallbackSkillsForRole(targetRole);
    }
    
    // Generate a more detailed prompt with domain context for Gemini
    const prompt = `Generate a detailed list of 8-12 key technical skills specifically required for a "${targetRole}" role in the tech industry.

The skills should be directly relevant to this specific role and not generic skills that apply to all tech roles.

For each skill, provide:
1. Skill name (specific technology, language, framework, or technical concept)
2. Importance level (Essential, Important, Helpful)
3. Short description that explains why this skill matters for a ${targetRole} (max 100 characters)
4. Estimated learning time in months

For example, if the role is "Frontend Developer", include skills like React, JavaScript, CSS, etc.
If the role is "Data Scientist", include skills like Python, SQL, Machine Learning, etc.

Ensure all skills are specifically relevant to a ${targetRole} role based on current industry standards.

Format the response as a JSON array of objects with the following structure:
[{
  "skillName": "Name of skill",
  "importance": "Essential/Important/Helpful",
  "description": "Brief description focused on this role",
  "learningTimeMonths": number
}]`;

    // Call Gemini for analysis
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    // First find the JSON part (between square brackets)
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    if (!jsonMatch) {
      console.error('No valid JSON found in Gemini response');
      return fallbackSkillsForRole(targetRole);
    }
    
    const jsonStr = jsonMatch[0];
    const skills = JSON.parse(jsonStr);
    
    // Validate the skills to ensure they're relevant
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      console.error('Invalid skills array returned from Gemini');
      return fallbackSkillsForRole(targetRole);
    }
    
    console.log(`Successfully generated ${skills.length} skills for ${targetRole} using Gemini API`);
    return skills;
  } catch (error) {
    console.error('Error generating required skills with Gemini:', error);
    // Return fallback skills if Gemini fails
    return fallbackSkillsForRole(targetRole);
  }
};

/**
 * Fallback skills for common roles when Gemini is not available
 * @param {string} targetRole - The target role
 * @returns {Array} - Array of required skills with details
 */
const fallbackSkillsForRole = (targetRole) => {
  const normalizedRole = targetRole.toLowerCase();
  
  if (normalizedRole.includes('front') || normalizedRole.includes('ui') || normalizedRole.includes('ux')) {
    return [
      {
        skillName: "HTML5",
        importance: "Essential",
        description: "Core markup language for structuring web content",
        learningTimeMonths: 1
      },
      {
        skillName: "CSS3",
        importance: "Essential",
        description: "Styling and layout for web pages",
        learningTimeMonths: 2
      },
      {
        skillName: "JavaScript",
        importance: "Essential",
        description: "Programming language for interactive web features",
        learningTimeMonths: 3
      },
      {
        skillName: "React",
        importance: "Important",
        description: "Popular JavaScript library for building user interfaces",
        learningTimeMonths: 2
      },
      {
        skillName: "Responsive Design",
        importance: "Essential",
        description: "Making web applications work on all screen sizes",
        learningTimeMonths: 1
      },
      {
        skillName: "CSS Frameworks",
        importance: "Helpful",
        description: "Bootstrap, Tailwind or similar for rapid development",
        learningTimeMonths: 1
      },
      {
        skillName: "Version Control",
        importance: "Important",
        description: "Git for tracking code changes",
        learningTimeMonths: 1
      },
      {
        skillName: "Browser DevTools",
        importance: "Important",
        description: "Tools for debugging and testing web applications",
        learningTimeMonths: 1
      }
    ];
  } else if (normalizedRole.includes('back') || normalizedRole.includes('api')) {
    return [
      {
        skillName: "Node.js",
        importance: "Essential",
        description: "JavaScript runtime for server-side applications",
        learningTimeMonths: 2
      },
      {
        skillName: "Express.js",
        importance: "Important",
        description: "Web framework for Node.js",
        learningTimeMonths: 1
      },
      {
        skillName: "Databases",
        importance: "Essential",
        description: "SQL or NoSQL database knowledge",
        learningTimeMonths: 2
      },
      {
        skillName: "API Design",
        importance: "Essential",
        description: "Designing RESTful or GraphQL APIs",
        learningTimeMonths: 2
      },
      {
        skillName: "Authentication",
        importance: "Important",
        description: "Implementing secure user authentication",
        learningTimeMonths: 1
      },
      {
        skillName: "Testing",
        importance: "Important",
        description: "Writing unit and integration tests",
        learningTimeMonths: 1
      },
      {
        skillName: "Security",
        importance: "Essential",
        description: "Web security best practices",
        learningTimeMonths: 2
      },
      {
        skillName: "Deployment",
        importance: "Important",
        description: "Deploying applications to production",
        learningTimeMonths: 1
      }
    ];
  } else if (normalizedRole.includes('full')) {
    return [
      {
        skillName: "JavaScript",
        importance: "Essential",
        description: "Core programming language for full-stack development",
        learningTimeMonths: 3
      },
      {
        skillName: "HTML/CSS",
        importance: "Essential",
        description: "Front-end markup and styling",
        learningTimeMonths: 2
      },
      {
        skillName: "React",
        importance: "Important",
        description: "Front-end JavaScript library",
        learningTimeMonths: 2
      },
      {
        skillName: "Node.js",
        importance: "Essential",
        description: "JavaScript runtime for back-end",
        learningTimeMonths: 2
      },
      {
        skillName: "Express.js",
        importance: "Important",
        description: "Web framework for Node.js",
        learningTimeMonths: 1
      },
      {
        skillName: "MongoDB",
        importance: "Important",
        description: "NoSQL database",
        learningTimeMonths: 1
      },
      {
        skillName: "REST APIs",
        importance: "Essential",
        description: "Building and consuming RESTful APIs",
        learningTimeMonths: 2
      },
      {
        skillName: "Git",
        importance: "Essential",
        description: "Version control system",
        learningTimeMonths: 1
      },
      {
        skillName: "Testing",
        importance: "Important",
        description: "Unit and integration testing",
        learningTimeMonths: 1
      },
      {
        skillName: "Deployment",
        importance: "Important",
        description: "Deploying full stack applications",
        learningTimeMonths: 1
      }
    ];
  } else if (normalizedRole.includes('data') || normalizedRole.includes('machine')) {
    return [
      {
        skillName: "Python",
        importance: "Essential",
        description: "Primary programming language for data science",
        learningTimeMonths: 3
      },
      {
        skillName: "SQL",
        importance: "Essential",
        description: "Database querying language",
        learningTimeMonths: 2
      },
      {
        skillName: "Data Analysis",
        importance: "Essential",
        description: "Pandas, NumPy for data manipulation",
        learningTimeMonths: 2
      },
      {
        skillName: "Data Visualization",
        importance: "Important",
        description: "Matplotlib, Seaborn for visualizing data",
        learningTimeMonths: 1
      },
      {
        skillName: "Machine Learning",
        importance: "Essential",
        description: "Scikit-learn, supervised/unsupervised learning",
        learningTimeMonths: 3
      },
      {
        skillName: "Statistics",
        importance: "Essential",
        description: "Statistical analysis and hypothesis testing",
        learningTimeMonths: 2
      },
      {
        skillName: "Deep Learning",
        importance: "Important",
        description: "Neural networks with TensorFlow/PyTorch",
        learningTimeMonths: 3
      },
      {
        skillName: "Big Data",
        importance: "Helpful",
        description: "Spark, Hadoop for large datasets",
        learningTimeMonths: 2
      }
    ];
  } else if (normalizedRole.includes('cloud')) {
    return [
      {
        skillName: "AWS/Azure/GCP",
        importance: "Essential",
        description: "Major cloud provider platforms and services",
        learningTimeMonths: 6
      },
      {
        skillName: "Terraform/CloudFormation",
        importance: "Essential",
        description: "Infrastructure as Code tools",
        learningTimeMonths: 4
      },
      {
        skillName: "Kubernetes",
        importance: "Essential",
        description: "Container orchestration platform",
        learningTimeMonths: 5
      },
      {
        skillName: "Docker",
        importance: "Essential",
        description: "Containerization technology",
        learningTimeMonths: 2
      },
      {
        skillName: "Cloud Networking",
        importance: "Essential",
        description: "VPCs, subnets, routing, and security groups",
        learningTimeMonths: 3
      },
      {
        skillName: "CI/CD Pipelines",
        importance: "Important",
        description: "Continuous integration and deployment",
        learningTimeMonths: 3
      },
      {
        skillName: "Linux Administration",
        importance: "Important",
        description: "Managing Linux servers and environments",
        learningTimeMonths: 4
      },
      {
        skillName: "Python/Bash Scripting",
        importance: "Important",
        description: "Automation and infrastructure management",
        learningTimeMonths: 3
      },
      {
        skillName: "Security Best Practices",
        importance: "Essential",
        description: "IAM, encryption, and security compliance",
        learningTimeMonths: 3
      },
      {
        skillName: "Monitoring & Logging",
        importance: "Important",
        description: "CloudWatch, Prometheus, and log management",
        learningTimeMonths: 2
      }
    ];
  } else {
    // Default generic technical skills
    return [
      {
        skillName: "Programming Fundamentals",
        importance: "Essential",
        description: "Core programming concepts",
        learningTimeMonths: 3
      },
      {
        skillName: "Problem Solving",
        importance: "Essential",
        description: "Analytical thinking and algorithm development",
        learningTimeMonths: 2
      },
      {
        skillName: "Version Control",
        importance: "Important",
        description: "Git for tracking code changes",
        learningTimeMonths: 1
      },
      {
        skillName: "Data Structures",
        importance: "Important",
        description: "Understanding data organization and storage",
        learningTimeMonths: 2
      },
      {
        skillName: "Communication Skills",
        importance: "Essential",
        description: "Effectively explain technical concepts",
        learningTimeMonths: 1
      },
      {
        skillName: "Project Management",
        importance: "Helpful",
        description: "Planning and organizing technical work",
        learningTimeMonths: 1
      },
      {
        skillName: "Continuous Learning",
        importance: "Essential",
        description: "Staying updated with new technologies",
        learningTimeMonths: 0
      }
    ];
  }
};

module.exports = {
  model,
  enhanceSkillDescription,
  enhanceToolDescription,
  generateRequiredSkillsForRole
}; 