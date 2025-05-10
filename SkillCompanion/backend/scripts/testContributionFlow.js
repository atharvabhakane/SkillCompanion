/**
 * Test script for the complete contribution flow
 * 
 * This script simulates:
 * 1. Submitting a new skill contribution
 * 2. Admin retrieving pending contributions
 * 3. Admin approving the contribution
 * 4. Verifying the contribution is stored correctly
 * 
 * To run:
 * node scripts/testContributionFlow.js
 */

const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Create test data
const testSkillContribution = {
  type: 'Skill',
  data: {
    skillName: 'GraphQL',
    category: 'API Technologies',
    demandLevel: 'High',
    growthRate: 'Rapid',
    averageSalary: '$110,000 - $150,000',
    requiredExperience: '1-3 years',
    descriptionKeywords: 'API query language, efficient data fetching, replaces REST, single endpoint',
    relatedSkills: ['React', 'Apollo', 'Node.js']
  },
  email: 'test@example.com'
};

// Credentials for admin login
const adminCredentials = {
  email: 'admin@gmail.com',
  password: 'thisisadmin'
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Simulate the entire flow
async function testContributionFlow() {
  console.log(`${colors.blue}=== TESTING CONTRIBUTION FLOW ===${colors.reset}\n`);
  
  try {
    // Step 1: Submit a contribution
    console.log(`${colors.yellow}Step 1: Submitting a skill contribution...${colors.reset}`);
    const submitResponse = await axios.post(`${API_URL}/contributions/submit`, testSkillContribution);
    
    if (submitResponse.data.status !== 'success') {
      throw new Error('Contribution submission failed');
    }
    
    const contributionId = submitResponse.data.data.contributionId;
    console.log(`${colors.green}✓ Contribution submitted successfully!${colors.reset}`);
    console.log(`  Contribution ID: ${contributionId}\n`);
    
    // Step 2: Login as admin
    console.log(`${colors.yellow}Step 2: Logging in as admin...${colors.reset}`);
    const loginResponse = await axios.post(`${API_URL}/admin/login`, adminCredentials);
    
    if (loginResponse.data.status !== 'success') {
      throw new Error('Admin login failed');
    }
    
    const adminToken = loginResponse.data.token;
    console.log(`${colors.green}✓ Admin login successful!${colors.reset}\n`);
    
    // Step 3: Get pending contributions
    console.log(`${colors.yellow}Step 3: Getting pending contributions...${colors.reset}`);
    const pendingResponse = await axios.get(`${API_URL}/contributions/pending`, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
    
    if (pendingResponse.data.status !== 'success') {
      throw new Error('Failed to get pending contributions');
    }
    
    const pendingContributions = pendingResponse.data.data.contributions;
    console.log(`${colors.green}✓ Retrieved ${pendingContributions.length} pending contributions!${colors.reset}`);
    
    // Find our contribution in the list
    const ourContribution = pendingContributions.find(c => c._id === contributionId);
    
    if (!ourContribution) {
      console.log(`${colors.yellow}! Our contribution wasn't found in the pending list.${colors.reset}`);
      console.log('  This could happen if there are many contributions or it was already reviewed.');
      console.log('  Getting all contributions to find ours...');
      
      const allResponse = await axios.get(`${API_URL}/contributions/all`);
      const allContributions = allResponse.data.data.contributions;
      const foundContribution = allContributions.find(c => c._id === contributionId);
      
      if (foundContribution) {
        console.log(`${colors.green}✓ Found our contribution in all contributions!${colors.reset}`);
        console.log(`  Status: ${foundContribution.status}`);
        
        if (foundContribution.status !== 'Pending') {
          console.log(`${colors.yellow}  Note: Contribution was already reviewed.${colors.reset}\n`);
          return;
        }
      } else {
        throw new Error('Our contribution was not found in any list');
      }
    } else {
      console.log(`${colors.green}✓ Found our contribution in the pending list!${colors.reset}\n`);
    }
    
    // Step 4: Approve the contribution
    console.log(`${colors.yellow}Step 4: Approving the contribution...${colors.reset}`);
    const approveResponse = await axios.patch(
      `${API_URL}/contributions/review/${contributionId}`,
      {
        status: 'Approved',
        reviewerNotes: 'This is a great contribution, approved in testing!'
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    if (approveResponse.data.status !== 'success') {
      throw new Error('Failed to approve contribution');
    }
    
    console.log(`${colors.green}✓ Contribution approved successfully!${colors.reset}`);
    console.log(`  Data updated: ${approveResponse.data.data.dataUpdated}`);
    console.log(`  Data source: ${approveResponse.data.data.dataSource || 'Not specified'}\n`);
    
    // Step 5: Verify the contribution was saved
    console.log(`${colors.yellow}Step 5: Verifying data storage...${colors.reset}`);
    
    if (approveResponse.data.data.dataSource === 'local_file') {
      const dataDir = path.join(__dirname, '../data');
      const filePath = path.join(dataDir, 'skills.json');
      
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const skills = JSON.parse(fileContent);
        const ourSkill = skills.find(s => s.skillName === testSkillContribution.data.skillName);
        
        if (ourSkill) {
          console.log(`${colors.green}✓ Verified skill was saved to local file!${colors.reset}`);
          console.log(`  File path: ${filePath}`);
        } else {
          console.log(`${colors.red}✗ Could not find our skill in the local file.${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ Local file does not exist: ${filePath}${colors.reset}`);
      }
    } else if (approveResponse.data.data.dataSource === 'google_sheets') {
      console.log(`${colors.green}✓ Contribution was saved to Google Sheets${colors.reset}`);
      console.log('  Note: Cannot verify Google Sheets content in this script');
    }
    
    console.log(`\n${colors.blue}=== TEST COMPLETED SUCCESSFULLY ===${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}ERROR: ${error.message}${colors.reset}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testContributionFlow(); 