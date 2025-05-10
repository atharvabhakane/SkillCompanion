const { google } = require('googleapis');
const sheets = google.sheets('v4');
const sheetsService = require('./sheetsService');
const fs = require('fs');
const path = require('path');

// Configure Google Sheets auth with write permissions
let auth;
try {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }
} catch (error) {
  console.error('Error initializing Google auth:', error);
}

// Save data to a CSV file in the root directory
const saveToCSV = async (type, data) => {
  try {
    // Define multiple possible paths to try
    const possiblePaths = [
      // Main path - project root/exports
      path.resolve(process.cwd(), '..', 'exports'),
      // Fallback 1 - direct parent directory
      path.resolve(process.cwd(), '../exports'),
      // Fallback 2 - backend/exports
      path.resolve(process.cwd(), 'exports'),
      // Fallback 3 - absolute fallback using direct parent
      path.join(process.cwd(), '../exports'),
      // Fallback 4 - inside backend directory
      path.join(__dirname, '../exports'),
      // Fallback 5 - in frontend public folder (accessible from browser)
      path.resolve(process.cwd(), '../frontend/public/exports')
    ];
    
    let filePath = null;
    let rootExportsDir = null;
    
    // Try each path until we find one that works
    for (const possiblePath of possiblePaths) {
      console.log(`Trying path: ${possiblePath}`);
      try {
        if (!fs.existsSync(possiblePath)) {
          console.log(`Path doesn't exist, creating: ${possiblePath}`);
          fs.mkdirSync(possiblePath, { recursive: true });
        }
        
        // Test if we can write to this directory
        const testFile = path.join(possiblePath, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile); // Remove test file
        
        // If we got here, we can write to this directory
        rootExportsDir = possiblePath;
        filePath = path.join(rootExportsDir, `${type.toLowerCase()}s.csv`);
        console.log(`Found writable directory: ${rootExportsDir}`);
        break;
      } catch (pathError) {
        console.error(`Cannot write to ${possiblePath}: ${pathError.message}`);
      }
    }
    
    if (!rootExportsDir || !filePath) {
      throw new Error('Could not find a writable directory for exports');
    }

    // Get headers and data row based on type
    let headers, row;
    
    // Log the path being used
    console.log(`Attempting to save CSV to: ${filePath}`);
    console.log(`Using exports directory: ${rootExportsDir}`);
    console.log(`Current working directory: ${process.cwd()}`);
    
    if (type.toLowerCase() === 'skill') {
      headers = [
        'ID', 'Name', 'Category', 'Demand Level', 'Growth Rate', 
        'Average Salary', 'Required Experience', 'Learning Resources',
        'Related Skills', 'Date Added', 'Contributor Email'
      ];
      
      row = [
        `SKILL_${Date.now()}`,
        data.skillName,
        data.category,
        data.demandLevel,
        data.growthRate,
        data.averageSalary,
        data.requiredExperience,
        data.learningResources,
        data.relatedSkills ? data.relatedSkills.join(', ') : '',
        new Date().toISOString().split('T')[0],
        data.contributorEmail
      ];
    } else if (type.toLowerCase() === 'tool') {
      headers = [
        'ID', 'Name', 'Category', 'Primary Use Cases', 'Skill Level Required', 
        'Pricing Model', 'Integration Capabilities', 'Relevant Industries',
        'Growth Trend', 'Date Added', 'Contributor Email'
      ];
      
      row = [
        `TOOL_${Date.now()}`,
        data.toolName,
        data.category,
        data.primaryUseCases || '',
        data.skillLevelRequired,
        data.pricingModel,
        data.integrationCapabilities,
        data.relevantIndustries ? data.relevantIndustries.join(', ') : '',
        data.growthTrend,
        new Date().toISOString().split('T')[0],
        data.contributorEmail
      ];
    } else {
      throw new Error(`Unknown type: ${type}`);
    }
    
    // Check if file exists to determine if we need to write headers
    const fileExists = fs.existsSync(filePath);
    
    // If file doesn't exist, write headers
    if (!fileExists) {
      console.log(`Creating new CSV file with headers: ${filePath}`);
      fs.writeFileSync(filePath, headers.join(',') + '\n');
    }
    
    // Escape any commas in the fields and wrap in quotes if needed
    const escapedRow = row.map(field => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      return stringField.includes(',') ? `"${stringField}"` : stringField;
    });
    
    // Append the data row to the CSV
    console.log(`Appending data to CSV file: ${filePath}`);
    fs.appendFileSync(filePath, escapedRow.join(',') + '\n');
    
    console.log(`Successfully saved ${type} to CSV file: ${filePath}`);
    
    // Return success info with the path for the frontend
    return {
      success: true,
      path: filePath,
      exportDir: rootExportsDir
    };
  } catch (error) {
    console.error(`Error saving to CSV file for ${type}:`, error);
    console.error(`Stack trace: ${error.stack}`);
    
    // Final fallback - save to a temporary file in the data directory
    try {
      const dataDir = path.join(__dirname, '../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const tempFilePath = path.join(dataDir, `${type.toLowerCase()}_${Date.now()}.csv`);
      console.log(`Final fallback - saving to: ${tempFilePath}`);
      
      // Simplified data for emergency fallback
      const csvData = `ID,Name,Type,Date\n${type}_${Date.now()},${type === 'skill' ? data.skillName : data.toolName},${type},${new Date().toISOString()}`;
      fs.writeFileSync(tempFilePath, csvData);
      
      console.log(`Saved emergency backup to: ${tempFilePath}`);
      return {
        success: true,
        path: tempFilePath,
        exportDir: dataDir,
        isFallback: true
      };
    } catch (fallbackError) {
      console.error(`Even fallback save failed: ${fallbackError.message}`);
      return {
        success: false,
        error: error.message,
        fallbackError: fallbackError.message
      };
    }
  }
};

// Fallback: Write to local JSON files if Google Sheets fails
const saveToLocalFile = async (type, data) => {
  try {
    const dataDir = path.join(__dirname, '../data');
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, `${type.toLowerCase()}s.json`);
    let existingData = [];
    
    // Read existing file if it exists
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      existingData = JSON.parse(fileContent);
    }
    
    // Add new data
    existingData.push({
      ...data,
      id: `${type.toUpperCase()}_${Date.now()}`,
      addedAt: new Date().toISOString()
    });
    
    // Write back to file
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    
    console.log(`Saved ${type} to local file: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving to local file for ${type}:`, error);
    return false;
  }
};

// Add skill to spreadsheet
const addSkillToSheet = async (skillData) => {
  try {
    // Generate a unique ID for the skill
    const skillId = `SKILL_${Date.now()}`;
    
    // Format data for the spreadsheet
    const rowData = [
      skillId,
      skillData.skillName,
      skillData.category,
      skillData.demandLevel,
      skillData.growthRate,
      skillData.averageSalary,
      skillData.requiredExperience,
      skillData.learningResources,
      skillData.relatedSkills ? skillData.relatedSkills.join(', ') : '',
      new Date().toISOString().split('T')[0], // Current date
      skillData.contributorEmail
    ];
    
    let googleSheetsSuccess = false;
    
    // Check if we can use Google Sheets
    if (auth) {
      try {
        // Append to spreadsheet
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.SKILL_SHEET_ID,
          range: 'Sheet1!A:K',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [rowData]
          },
          auth: await auth.getClient(),
        });
        
        // Invalidate cache
        sheetsService.invalidateCache('skills');
        
        console.log('Successfully added skill to Google Sheets');
        googleSheetsSuccess = true;
      } catch (error) {
        console.error('Error adding to Google Sheets, will try local fallback:', error);
        googleSheetsSuccess = false;
      }
    }
    
    // Always save to CSV file in root directory regardless of Google Sheets success
    const csvResult = await saveToCSV('skill', skillData);
    
    // If Google Sheets failed or is not configured, try local JSON file
    let localFileSuccess = false;
    if (!googleSheetsSuccess) {
      localFileSuccess = await saveToLocalFile('skill', skillData);
    }
    
    return {
      success: true,
      skillId,
      fallback: !googleSheetsSuccess,
      csvSaved: csvResult.success,
      csvPath: csvResult.path || null,
      exportDir: csvResult.exportDir || null
    };
  } catch (error) {
    console.error('Error adding skill to sheet:', error);
    
    // Try local fallback if everything else fails
    const localSaved = await saveToLocalFile('skill', skillData);
    const csvResult = await saveToCSV('skill', skillData);
    
    if (localSaved || csvResult.success) {
      return {
        success: true,
        skillId: `SKILL_${Date.now()}_LOCAL`,
        fallback: true,
        csvSaved: csvResult.success,
        csvPath: csvResult.path || null,
        exportDir: csvResult.exportDir || null
      };
    }
    
    throw error;
  }
};

// Add tool to spreadsheet
const addToolToSheet = async (toolData) => {
  try {
    // Generate a unique ID for the tool
    const toolId = `TOOL_${Date.now()}`;
    
    // Format data for the spreadsheet
    const rowData = [
      toolId,
      toolData.toolName,
      toolData.category,
      toolData.primaryUseCases,
      toolData.skillLevelRequired,
      toolData.pricingModel,
      toolData.integrationCapabilities,
      toolData.relevantIndustries ? toolData.relevantIndustries.join(', ') : '',
      toolData.growthTrend,
      new Date().toISOString().split('T')[0], // Current date
      toolData.contributorEmail
    ];
    
    let googleSheetsSuccess = false;
    
    // Check if we can use Google Sheets
    if (auth) {
      try {
        // Append to spreadsheet
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.TOOL_SHEET_ID,
          range: 'Sheet1!A:K',
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [rowData]
          },
          auth: await auth.getClient(),
        });
        
        // Invalidate cache
        sheetsService.invalidateCache('tools');
        
        console.log('Successfully added tool to Google Sheets');
        googleSheetsSuccess = true;
      } catch (error) {
        console.error('Error adding to Google Sheets, will try local fallback:', error);
        googleSheetsSuccess = false;
      }
    }
    
    // Always save to CSV file in root directory regardless of Google Sheets success
    const csvResult = await saveToCSV('tool', toolData);
    
    // If Google Sheets failed or is not configured, try local JSON file
    let localFileSuccess = false;
    if (!googleSheetsSuccess) {
      localFileSuccess = await saveToLocalFile('tool', toolData);
    }
    
    return {
      success: true,
      toolId,
      fallback: !googleSheetsSuccess,
      csvSaved: csvResult.success,
      csvPath: csvResult.path || null,
      exportDir: csvResult.exportDir || null
    };
  } catch (error) {
    console.error('Error adding tool to sheet:', error);
    
    // Try local fallback if everything else fails
    const localSaved = await saveToLocalFile('tool', toolData);
    const csvResult = await saveToCSV('tool', toolData);
    
    if (localSaved || csvResult.success) {
      return {
        success: true,
        toolId: `TOOL_${Date.now()}_LOCAL`,
        fallback: true,
        csvSaved: csvResult.success,
        csvPath: csvResult.path || null,
        exportDir: csvResult.exportDir || null
      };
    }
    
    throw error;
  }
};

module.exports = {
  addSkillToSheet,
  addToolToSheet
}; 