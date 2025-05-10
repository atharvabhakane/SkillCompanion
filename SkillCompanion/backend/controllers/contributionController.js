const Contribution = require('../models/Contribution');
const Admin = require('../models/Admin');
const geminiService = require('../services/geminiService');
const sheetsUpdateService = require('../services/sheetsUpdateService');
const nodemailer = require('nodemailer');

// Create email transporter (commented out since we need actual credentials)
/*
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
*/

// Submit a contribution
exports.submitContribution = async (req, res) => {
  try {
    const { type, data, email } = req.body;
    
    // Log the received contribution for debugging
    console.log('Received contribution:', type);
    console.log('Data:', data);
    console.log('Email:', email);
    
    if (!type || !data || !email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid email format'
      });
    }
    
    // Create a copy of the data object to avoid modifying the original
    const processedData = { ...data };
    
    // Enhanced description with Gemini if keywords are provided
    if (type === 'Skill' && processedData.descriptionKeywords) {
      try {
        if (process.env.GEMINI_API_KEY) {
          processedData.learningResources = await geminiService.enhanceSkillDescription(
            processedData.descriptionKeywords,
            processedData.skillName,
            processedData.category
          );
          console.log('Successfully enhanced skill description with Gemini');
        } else {
          // No Gemini API key, fallback to using keywords directly
          processedData.learningResources = processedData.descriptionKeywords;
          console.log('Gemini API Key not available - using keywords as is');
        }
      } catch (error) {
        console.error('Gemini enhancement error:', error);
        // Use descriptionKeywords as fallback
        processedData.learningResources = processedData.descriptionKeywords;
      }
      // Remove from data as it's processed
      delete processedData.descriptionKeywords;
    } else if (type === 'Tool' && processedData.descriptionKeywords) {
      try {
        if (process.env.GEMINI_API_KEY) {
          processedData.primaryUseCases = await geminiService.enhanceToolDescription(
            processedData.descriptionKeywords,
            processedData.toolName,
            processedData.category
          );
          console.log('Successfully enhanced tool description with Gemini');
        } else {
          // No Gemini API key, fallback to using keywords directly
          processedData.primaryUseCases = processedData.descriptionKeywords;
          console.log('Gemini API Key not available - using keywords as is');
        }
      } catch (error) {
        console.error('Gemini enhancement error:', error);
        // Use descriptionKeywords as fallback
        processedData.primaryUseCases = processedData.descriptionKeywords;
      }
      // Remove from data as it's processed
      delete processedData.descriptionKeywords;
    }
    
    // Create new contribution
    const contribution = new Contribution({
      type,
      data: processedData,
      contributorEmail: email
    });
    
    await contribution.save();
    
    // Notify admins (commented out until email functionality is set up)
    /*
    const admins = await Admin.find();
    if (admins.length > 0) {
      const adminEmails = admins.map(admin => admin.email);
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: adminEmails.join(','),
        subject: `New ${type} Contribution Submitted`,
        text: `A new ${type} has been submitted for review.\n\nContributor: ${email}\n\nPlease login to the admin panel to review the submission.`,
        html: `<h3>New ${type} Contribution</h3>
               <p>A new ${type} has been submitted for review.</p>
               <p><strong>Contributor:</strong> ${email}</p>
               <p>Please login to the admin panel to review the submission.</p>`
      };
      
      transporter.sendMail(mailOptions);
    }
    */
    
    res.status(201).json({
      status: 'success',
      message: 'Contribution submitted successfully',
      data: {
        contributionId: contribution._id
      }
    });
  } catch (error) {
    console.error('Contribution submission error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to submit contribution',
      error: error.message
    });
  }
};

// Admin: Get all pending contributions
exports.getPendingContributions = async (req, res) => {
  try {
    // Verify admin
    const adminId = req.admin.adminId;
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied'
      });
    }
    
    const pendingContributions = await Contribution.find({ status: 'Pending' })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: pendingContributions.length,
      data: {
        contributions: pendingContributions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch pending contributions',
      error: error.message
    });
  }
};

// Admin: Review a contribution
exports.reviewContribution = async (req, res) => {
  try {
    const { contributionId } = req.params;
    const { status, reviewerNotes } = req.body;
    
    console.log(`Reviewing contribution ${contributionId} with status: ${status}`);
    
    // Verify admin
    const adminId = req.admin.adminId;
    const admin = await Admin.findById(adminId);
    
    if (!admin) {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied'
      });
    }
    
    const contribution = await Contribution.findById(contributionId);
    
    if (!contribution) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contribution not found'
      });
    }
    
    // Update contribution status
    contribution.status = status;
    if (reviewerNotes) {
      contribution.reviewerNotes = reviewerNotes;
    }
    contribution.updatedAt = new Date();
    
    try {
      await contribution.save();
      console.log(`Successfully updated contribution status to: ${status}`);
    } catch (saveError) {
      console.error('Error saving contribution status:', saveError);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update contribution status',
        error: saveError.message
      });
    }
    
    // If approved, add to database and files
    let dataUpdateResult = null;
    let csvInfo = null;
    let exportError = null;
    
    if (status === 'Approved') {
      console.log(`Contribution approved: ${contribution.type}`);
      console.log('Data:', JSON.stringify(contribution.data, null, 2));
      
      try {
        // Set contributorEmail in the data object
        const dataWithEmail = { 
          ...contribution.data, 
          contributorEmail: contribution.contributorEmail 
        };
        
        // Try to add to spreadsheet and CSV
        try {
          if (contribution.type === 'Skill') {
            dataUpdateResult = await sheetsUpdateService.addSkillToSheet(dataWithEmail);
            console.log('Skill update result:', dataUpdateResult);
          } else if (contribution.type === 'Tool') {
            dataUpdateResult = await sheetsUpdateService.addToolToSheet(dataWithEmail);
            console.log('Tool update result:', dataUpdateResult);
          }
          
          // Extract CSV file information
          if (dataUpdateResult && dataUpdateResult.csvSaved) {
            csvInfo = {
              path: dataUpdateResult.csvPath,
              directory: dataUpdateResult.exportDir,
              // Create a relative path for frontend display
              relativePath: dataUpdateResult.csvPath ? 
                dataUpdateResult.csvPath.replace(process.cwd(), '') : null
            };
            console.log('CSV Info:', csvInfo);
          }
          
          // Log success
          console.log(`Successfully added to ${dataUpdateResult.fallback ? 'local file' : 'Google Sheets'}`);
          
          if (dataUpdateResult.csvSaved) {
            console.log(`Successfully added to CSV file: ${dataUpdateResult.csvPath}`);
          }
        } catch (exportAttemptError) {
          console.error('Error during export attempt:', exportAttemptError);
          exportError = exportAttemptError.message;
          
          // Emergency fallback: create a minimal JSON export in a safe location
          try {
            const fs = require('fs');
            const path = require('path');
            const uuid = require('uuid').v4;
            
            // Create emergency backup directory
            const emergencyDir = path.join(__dirname, '../emergency_backups');
            if (!fs.existsSync(emergencyDir)) {
              fs.mkdirSync(emergencyDir, { recursive: true });
            }
            
            // Generate unique filename
            const emergencyFilename = `${contribution.type.toLowerCase()}_${uuid()}.json`;
            const emergencyPath = path.join(emergencyDir, emergencyFilename);
            
            // Write emergency backup
            fs.writeFileSync(
              emergencyPath, 
              JSON.stringify(dataWithEmail, null, 2)
            );
            
            console.log(`Created emergency backup at: ${emergencyPath}`);
            
            // Create minimal result object
            dataUpdateResult = {
              success: true,
              fallback: true,
              csvSaved: true,
              csvPath: emergencyPath,
              exportDir: emergencyDir
            };
            
            // Create CSV info for frontend
            csvInfo = {
              path: emergencyPath,
              directory: emergencyDir,
              relativePath: emergencyPath.replace(process.cwd(), ''),
              isEmergencyBackup: true
            };
          } catch (emergencyError) {
            console.error('Even emergency backup failed:', emergencyError);
            // Still continue with approval
            dataUpdateResult = {
              success: false,
              fallback: true,
              error: `${exportAttemptError.message}; Emergency backup also failed: ${emergencyError.message}`
            };
          }
        }
        
        // Update contribution with source information regardless of export success
        // This ensures the contribution is still approved in the database
        try {
          contribution.dataSource = dataUpdateResult?.fallback ? 'local_file' : 'google_sheets';
          if (dataUpdateResult?.skillId || dataUpdateResult?.toolId) {
            contribution.externalId = dataUpdateResult.skillId || dataUpdateResult.toolId;
          }
          
          // Add CSV path information if available
          if (csvInfo && csvInfo.relativePath) {
            contribution.csvPath = csvInfo.relativePath;
          }
          
          await contribution.save();
          console.log('Updated contribution with export information');
        } catch (sourceUpdateError) {
          console.error('Error updating contribution with source info:', sourceUpdateError);
          // Continue anyway - the contribution has been approved
        }
      } catch (overallExportError) {
        console.error('Fatal error in export process:', overallExportError);
        exportError = overallExportError.message;
        // Still continue with approval - don't fail the approval just because of export issues
      }
    }
    
    // Notify contributor (commented out until email functionality is set up)
    /*
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: contribution.contributorEmail,
      subject: `Your ${contribution.type} Submission Status: ${status}`,
      text: `Your ${contribution.type} submission has been ${status.toLowerCase()}.\n\n${reviewerNotes ? `Reviewer notes: ${reviewerNotes}` : ''}`,
      html: `<h3>Submission ${status}</h3>
             <p>Your ${contribution.type} submission has been ${status.toLowerCase()}.</p>
             ${reviewerNotes ? `<p><strong>Reviewer notes:</strong> ${reviewerNotes}</p>` : ''}`
    };
    
    transporter.sendMail(mailOptions);
    */
    
    res.status(200).json({
      status: 'success',
      message: `Contribution ${status.toLowerCase()} successfully`,
      data: {
        contribution,
        dataUpdated: status === 'Approved' ? (dataUpdateResult !== null) : false,
        dataSource: dataUpdateResult?.fallback ? 'local_file' : 'google_sheets',
        csvSaved: status === 'Approved' ? dataUpdateResult?.csvSaved : false,
        csvInfo: csvInfo || null,
        exportError: exportError
      }
    });
  } catch (error) {
    console.error('Contribution review error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      status: 'error',
      message: 'Failed to review contribution',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all contributions (for testing purposes)
exports.getAllContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: contributions.length,
      data: {
        contributions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contributions',
      error: error.message
    });
  }
}; 