const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
const fs = require('fs');
const NodeCache = require('node-cache');

// Cache setup - data expires after 1 hour
const sheetsCache = new NodeCache({ stdTTL: 3600 });

// Get credentials
const credentialsPath = path.resolve(__dirname, '../../credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

// Fetch skills data from Google Sheet
const getSkillsData = async () => {
  // Check cache first
  const cachedData = sheetsCache.get('skills');
  if (cachedData) {
    return cachedData;
  }

  try {
    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(process.env.SKILL_SHEET_ID);

    // Initialize Auth - newer version uses this method
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });
    
    // Load document properties and worksheets
    await doc.loadInfo();
    
    // Get the skills sheet by title
    const sheet = Object.values(doc.sheetsById).find(s => s.title === 'Trending Skill Data');
    
    if (!sheet) {
      throw new Error('Sheet "Trending Skill Data" not found');
    }
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Transform row data into objects with named properties
    const skills = rows.map(row => {
      // Access the raw data array
      const rawData = row._rawData;
      
      return {
        skillId: rawData[0] || '',
        skillName: rawData[1] || '',
        category: rawData[2] || '',
        demandLevel: rawData[3] || '',
        growthRate: rawData[4] || '',
        averageSalary: rawData[5] || '',
        requiredExperience: rawData[6] || '',
        learningResources: rawData[7] || '',
        relatedSkills: rawData[8] ? rawData[8].split(',').map(s => s.trim()) : [],
        lastUpdated: rawData[9] || '',
        contributorId: rawData[10] || ''
      };
    });

    // Store in cache
    sheetsCache.set('skills', skills);
    
    return skills;
  } catch (error) {
    console.error('Error fetching skills data:', error);
    throw error;
  }
};

// Fetch tools data from Google Sheet
const getToolsData = async () => {
  // Check cache first
  const cachedData = sheetsCache.get('tools');
  if (cachedData) {
    return cachedData;
  }

  try {
    // Initialize the sheet - doc ID is the long id in the sheets URL
    const doc = new GoogleSpreadsheet(process.env.TOOL_SHEET_ID);
    
    // Initialize Auth - newer version uses this method
    await doc.useServiceAccountAuth({
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    });
    
    // Load document properties and worksheets
    await doc.loadInfo();
    
    // Get the tools sheet by title
    const sheet = Object.values(doc.sheetsById).find(s => s.title === 'Trending Tool Data');
    
    if (!sheet) {
      throw new Error('Sheet "Trending Tool Data" not found');
    }
    
    // Get all rows
    const rows = await sheet.getRows();
    
    // Transform row data into objects with named properties
    const tools = rows.map(row => {
      // Access the raw data array
      const rawData = row._rawData;
      
      return {
        toolId: rawData[0] || '',
        toolName: rawData[1] || '',
        category: rawData[2] || '',
        primaryUseCases: rawData[3] || '',
        skillLevelRequired: rawData[4] || '',
        pricingModel: rawData[5] || '',
        integrationCapabilities: rawData[6] || '',
        relevantIndustries: rawData[7] ? rawData[7].split(',').map(i => i.trim()) : [],
        growthTrend: rawData[8] || '',
        lastUpdated: rawData[9] || '',
        contributorId: rawData[10] || ''
      };
    });

    // Store in cache
    sheetsCache.set('tools', tools);
    
    return tools;
  } catch (error) {
    console.error('Error fetching tools data:', error);
    throw error;
  }
};

// Invalidate cache (to be used when data is updated)
const invalidateCache = (key) => {
  if (key) {
    sheetsCache.del(key);
  } else {
    sheetsCache.flushAll();
  }
};

module.exports = {
  getSkillsData,
  getToolsData,
  invalidateCache
}; 