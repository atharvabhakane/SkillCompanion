const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const NodeCache = require('node-cache');

// Cache setup - data expires after 1 hour
const trendsCache = new NodeCache({ stdTTL: 3600 });

/**
 * Parse CSV file and return data as JSON
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Parsed data
 */
const parseCSVFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

/**
 * Get skill trends data
 * @returns {Promise<Object>} - Skill trends data
 */
const getSkillTrendsData = async () => {
  // Check cache first
  const cachedData = trendsCache.get('skillTrends');
  if (cachedData) {
    return cachedData;
  }

  try {
    const filePath = path.join(__dirname, '../data/skillTrendsData.csv');
    const skillsData = await parseCSVFile(filePath);
    
    // Process the data
    const processedData = {
      allSkills: skillsData,
      topSkillsByDemand: processTopSkillsByDemand(skillsData),
      topSkillsByGrowth: processTopSkillsByGrowth(skillsData),
      topSkillsBySalary: processTopSkillsBySalary(skillsData),
      skillsByCategory: processSkillsByCategory(skillsData),
      skillsTimeline: processSkillsTimeline(skillsData),
    };
    
    // Store in cache
    trendsCache.set('skillTrends', processedData);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching skill trends data:', error);
    throw error;
  }
};

/**
 * Get skill gap data
 * @returns {Promise<Object>} - Skill gap data
 */
const getSkillGapData = async () => {
  // Check cache first
  const cachedData = trendsCache.get('skillGap');
  if (cachedData) {
    return cachedData;
  }

  try {
    const filePath = path.join(__dirname, '../data/skillGapData.csv');
    const gapData = await parseCSVFile(filePath);
    
    // Process the data
    const processedData = {
      allGapData: gapData,
      gapByRole: processGapByRole(gapData),
      impactOnSalary: processImpactOnSalary(gapData),
    };
    
    // Store in cache
    trendsCache.set('skillGap', processedData);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching skill gap data:', error);
    throw error;
  }
};

/**
 * Get regional skill demand data
 * @returns {Promise<Object>} - Regional skill demand data
 */
const getRegionalSkillData = async () => {
  // Check cache first
  const cachedData = trendsCache.get('regionalSkill');
  if (cachedData) {
    return cachedData;
  }

  try {
    const filePath = path.join(__dirname, '../data/skillRegionData.csv');
    const regionData = await parseCSVFile(filePath);
    
    // Process the data
    const processedData = {
      allRegionalData: regionData,
      demandByRegion: processRegionalDemand(regionData),
      growthByRegion: processRegionalGrowth(regionData),
      salaryByRegion: processRegionalSalary(regionData),
    };
    
    // Store in cache
    trendsCache.set('regionalSkill', processedData);
    
    return processedData;
  } catch (error) {
    console.error('Error fetching regional skill data:', error);
    throw error;
  }
};

/**
 * Process skills by demand
 * @param {Array} data - Raw skills data
 * @returns {Array} - Processed skills by demand
 */
const processTopSkillsByDemand = (data) => {
  // Convert demandLevel to numeric value for sorting
  const demandLevelMap = {
    'Very High': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  
  return data
    .filter(skill => skill.region === 'Global')
    .map(skill => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category,
      demandLevel: skill.demandLevel,
      growthRate: skill.growthRate,
      averageSalary: skill.averageSalary,
      demandScore: demandLevelMap[skill.demandLevel] || 0
    }))
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 10);
};

/**
 * Process skills by growth rate
 * @param {Array} data - Raw skills data
 * @returns {Array} - Processed skills by growth
 */
const processTopSkillsByGrowth = (data) => {
  return data
    .filter(skill => skill.region === 'Global')
    .map(skill => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category,
      demandLevel: skill.demandLevel,
      growthRate: skill.growthRate,
      averageSalary: skill.averageSalary,
      growthRateNumeric: parseFloat(skill.growthRate.replace('%', '')) || 0
    }))
    .sort((a, b) => b.growthRateNumeric - a.growthRateNumeric)
    .slice(0, 10);
};

/**
 * Process skills by salary
 * @param {Array} data - Raw skills data
 * @returns {Array} - Processed skills by salary
 */
const processTopSkillsBySalary = (data) => {
  return data
    .filter(skill => skill.region === 'Global')
    .map(skill => ({
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category,
      demandLevel: skill.demandLevel,
      growthRate: skill.growthRate,
      averageSalary: skill.averageSalary,
      salaryNumeric: parseInt(skill.averageSalary.replace(/[^0-9]/g, '')) || 0
    }))
    .sort((a, b) => b.salaryNumeric - a.salaryNumeric)
    .slice(0, 10);
};

/**
 * Process skills by category
 * @param {Array} data - Raw skills data
 * @returns {Object} - Skills grouped by category
 */
const processSkillsByCategory = (data) => {
  const globalSkills = data.filter(skill => skill.region === 'Global');
  
  // Group skills by category
  const skillsByCategory = {};
  
  globalSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    
    skillsByCategory[skill.category].push({
      skillId: skill.skillId,
      skillName: skill.skillName,
      demandLevel: skill.demandLevel,
      growthRate: skill.growthRate,
      averageSalary: skill.averageSalary,
      subcategory: skill.subcategory
    });
  });
  
  // Sort each category by demand level
  const demandLevelMap = {
    'Very High': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  
  Object.keys(skillsByCategory).forEach(category => {
    skillsByCategory[category].sort((a, b) => 
      (demandLevelMap[b.demandLevel] || 0) - (demandLevelMap[a.demandLevel] || 0)
    );
  });
  
  return skillsByCategory;
};

/**
 * Process skills timeline data
 * @param {Array} data - Raw skills data
 * @returns {Object} - Skills timeline data
 */
const processSkillsTimeline = (data) => {
  const globalSkills = data.filter(skill => skill.region === 'Global');
  
  return globalSkills.map(skill => {
    let timelineData = [];
    
    try {
      timelineData = JSON.parse(skill.timelineData);
    } catch (e) {
      console.error(`Error parsing timeline data for ${skill.skillName}:`, e);
    }
    
    return {
      skillId: skill.skillId,
      skillName: skill.skillName,
      category: skill.category,
      timeline: timelineData
    };
  });
};

/**
 * Process gap data by role
 * @param {Array} data - Raw gap data
 * @returns {Object} - Gap data by role
 */
const processGapByRole = (data) => {
  // Group by role
  const gapByRole = {};
  
  data.forEach(item => {
    if (!gapByRole[item.roleId]) {
      gapByRole[item.roleId] = {
        roleId: item.roleId,
        roleName: item.roleName,
        skills: []
      };
    }
    
    gapByRole[item.roleId].skills.push({
      skillId: item.skillId,
      skillName: item.skillName,
      requiredProficiency: parseInt(item.requiredProficiency) || 0,
      averageUserProficiency: parseInt(item.averageUserProficiency) || 0,
      gapScore: parseInt(item.gapScore) || 0,
      impactOnSalary: item.impactOnSalary,
      demandTrend: item.demandTrend
    });
  });
  
  return gapByRole;
};

/**
 * Process impact on salary
 * @param {Array} data - Raw gap data
 * @returns {Array} - Impact on salary data
 */
const processImpactOnSalary = (data) => {
  const impactMap = {
    'High': 3,
    'Medium': 2,
    'Low': 1
  };
  
  // Filter unique skills
  const uniqueSkills = Array.from(new Set(data.map(item => item.skillId)))
    .map(skillId => {
      const skillItem = data.find(item => item.skillId === skillId);
      return {
        skillId: skillItem.skillId,
        skillName: skillItem.skillName,
        gapScore: parseInt(skillItem.gapScore) || 0,
        impactOnSalary: skillItem.impactOnSalary,
        impactScore: impactMap[skillItem.impactOnSalary] || 0
      };
    })
    .sort((a, b) => b.impactScore - a.impactScore);
  
  return uniqueSkills;
};

/**
 * Process regional demand data
 * @param {Array} data - Raw regional data
 * @returns {Object} - Demand by region data
 */
const processRegionalDemand = (data) => {
  // Get unique regions and skills
  const regions = Array.from(new Set(data.map(item => item.region)));
  const skills = Array.from(new Set(data.map(item => item.skillName)));
  
  // Create demand matrix
  const demandMatrix = {};
  
  regions.forEach(region => {
    demandMatrix[region] = {};
    
    skills.forEach(skill => {
      const entry = data.find(item => item.region === region && item.skillName === skill);
      
      if (entry) {
        demandMatrix[region][skill] = parseInt(entry.demandScore) || 0;
      } else {
        demandMatrix[region][skill] = 0;
      }
    });
  });
  
  return {
    regions,
    skills,
    demandMatrix
  };
};

/**
 * Process regional growth data
 * @param {Array} data - Raw regional data
 * @returns {Object} - Growth by region data
 */
const processRegionalGrowth = (data) => {
  // Get unique regions and skills
  const regions = Array.from(new Set(data.map(item => item.region)));
  const skills = Array.from(new Set(data.map(item => item.skillName)));
  
  // Create growth matrix
  const growthMatrix = {};
  
  regions.forEach(region => {
    growthMatrix[region] = {};
    
    skills.forEach(skill => {
      const entry = data.find(item => item.region === region && item.skillName === skill);
      
      if (entry) {
        growthMatrix[region][skill] = parseFloat(entry.growthRate.replace('%', '')) || 0;
      } else {
        growthMatrix[region][skill] = 0;
      }
    });
  });
  
  return {
    regions,
    skills,
    growthMatrix
  };
};

/**
 * Process regional salary data
 * @param {Array} data - Raw regional data
 * @returns {Object} - Salary by region data
 */
const processRegionalSalary = (data) => {
  // Get unique regions and skills
  const regions = Array.from(new Set(data.map(item => item.region)));
  const skills = Array.from(new Set(data.map(item => item.skillName)));
  
  // Create salary matrix
  const salaryMatrix = {};
  
  regions.forEach(region => {
    salaryMatrix[region] = {};
    
    skills.forEach(skill => {
      const entry = data.find(item => item.region === region && item.skillName === skill);
      
      if (entry) {
        salaryMatrix[region][skill] = parseInt(entry.averageSalary.replace(/[^0-9]/g, '')) || 0;
      } else {
        salaryMatrix[region][skill] = 0;
      }
    });
  });
  
  return {
    regions,
    skills,
    salaryMatrix
  };
};

// Invalidate cache (to be used when data is updated)
const invalidateCache = (key) => {
  if (key) {
    trendsCache.del(key);
  } else {
    trendsCache.flushAll();
  }
};

module.exports = {
  getSkillTrendsData,
  getSkillGapData,
  getRegionalSkillData,
  invalidateCache
}; 