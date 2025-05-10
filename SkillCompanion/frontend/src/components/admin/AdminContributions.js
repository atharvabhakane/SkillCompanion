import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminContributions.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Custom spinner component to avoid React rendering issues
const Spinner = () => (
  <div className="spinner">
    <div className="spinner-inner"></div>
  </div>
);

const AdminContributions = () => {
  const [contributions, setContributions] = useState([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewNotes, setReviewNotes] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [csvLink, setCsvLink] = useState('');

  const refreshContributions = () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage('');
    setCsvLink('');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setError('No admin authorization token found. Please log in again.');
          setIsLoading(false);
          return;
        }
        
        // Fetch pending contributions
        const response = await axios.get(`${API_URL}/contributions/pending`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data && response.data.data && response.data.data.contributions) {
          setContributions(response.data.data.contributions);
          
          // Initialize review notes state
          const notesObj = {};
          response.data.data.contributions.forEach(contrib => {
            notesObj[contrib._id] = '';
          });
          setReviewNotes(notesObj);
        } else {
          setContributions([]);
          console.error('Unexpected API response format:', response.data);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching contributions:', err);
        setError('Failed to load contributions. Make sure you have admin privileges.');
        setIsLoading(false);
      }
    };

    fetchContributions();
  }, [refreshTrigger]);

  const handleNotesChange = (id, value) => {
    setReviewNotes({
      ...reviewNotes,
      [id]: value
    });
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(prev => ({...prev, [id]: true}));
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No admin authorization token found. Please log in again.');
        setActionLoading(prev => ({...prev, [id]: false}));
        return;
      }
      
      console.log(`Initiating approval for contribution ${id}`);
      
      const response = await axios.patch(`${API_URL}/contributions/review/${id}`, {
        status: 'Approved',
        reviewerNotes: reviewNotes[id]
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Server response:', response.data);
      
      // Check if data was updated to a file
      if (response.data && response.data.data) {
        const { dataUpdated, dataSource, csvSaved, csvInfo, exportError } = response.data.data;
        
        console.log('Export details:', { dataUpdated, dataSource, csvSaved, hasInfo: !!csvInfo, exportError });
        
        if (dataUpdated) {
          let message = '';
          let csvDetails = '';
          
          // Primary data source
          const primarySource = dataSource === 'google_sheets' ? 'Google Sheets' : 'JSON file';
          
          // CSV file status
          if (csvSaved && csvInfo) {
            // If emergency backup, show different message
            if (csvInfo.isEmergencyBackup) {
              message = `Contribution approved! (Note: Used emergency backup due to export issues)`;
              csvDetails = `Backup saved at: ${csvInfo.path}`;
            } else {
              // Add CSV information if we have path details
              if (csvInfo.relativePath) {
                // For the frontend public directory, create a URL that can be linked
                if (csvInfo.relativePath.includes('/public/')) {
                  const publicPath = csvInfo.relativePath.split('/public/')[1];
                  csvDetails = `<a href="/${publicPath}" target="_blank" class="csv-link">Download CSV</a>`;
                } else {
                  csvDetails = `CSV saved at: ${csvInfo.path}`;
                }
              }
              message = `Contribution approved and added to ${primarySource} and CSV file!`;
            }
          } else {
            // Basic success message
            message = `Contribution approved and added to ${primarySource}!`;
            
            // If we have an error but still approved, show a warning
            if (exportError) {
              message += ` (Note: Some export issues occurred)`;
            }
          }
          
          // Set success message with HTML if we have a download link
          setSuccessMessage(message);
          
          // If we have a CSV link, add it to a separate state for rendering
          if (csvDetails) {
            setCsvLink(csvDetails);
          }
        } else {
          // Basic approval message
          setSuccessMessage('Contribution approved successfully!');
        }
      } else {
        // Simple success message as fallback
        setSuccessMessage('Contribution approved successfully!');
      }
      
      // Update local state
      setContributions(contributions.filter(contrib => contrib._id !== id));
      setActionLoading(prev => ({...prev, [id]: false}));
    } catch (err) {
      console.error('Error approving contribution:', err);
      // Get detailed error message if available
      let errorMessage = 'Failed to approve contribution. Please try again.';
      
      if (err.response?.data?.error) {
        errorMessage = `Error: ${err.response.data.error}`;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
      setActionLoading(prev => ({...prev, [id]: false}));
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(prev => ({...prev, [id]: true}));
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setError('No admin authorization token found. Please log in again.');
        setActionLoading(prev => ({...prev, [id]: false}));
        return;
      }
      
      await axios.patch(`${API_URL}/contributions/review/${id}`, {
        status: 'Rejected',
        reviewerNotes: reviewNotes[id]
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccessMessage('Contribution rejected successfully!');
      
      // Update local state
      setContributions(contributions.filter(contrib => contrib._id !== id));
      setActionLoading(prev => ({...prev, [id]: false}));
    } catch (err) {
      console.error('Error rejecting contribution:', err);
      setError('Failed to reject contribution. Please try again.');
      setActionLoading(prev => ({...prev, [id]: false}));
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <Spinner />
        <p>Loading contributions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="admin-contributions">
      <div className="admin-section-header">
        <div className="header-left">
          <h2>Pending Contributions</h2>
          <p>Review and manage user contributions</p>
        </div>
        <div className="header-right">
          <button 
            className="refresh-btn" 
            onClick={refreshContributions}
            disabled={loading}
          >
            {loading ? <Spinner /> : "Refresh"}
          </button>
        </div>
      </div>
      
      {successMessage && (
        <div className="success-message">
          <div className="success-content">
            <p>{successMessage}</p>
            {csvLink && (
              <div 
                className="csv-link-container" 
                dangerouslySetInnerHTML={{ __html: csvLink }}
              />
            )}
          </div>
          <button 
            onClick={() => {
              setSuccessMessage('');
              setCsvLink('');
            }} 
            className="close-btn"
          >
            ×
          </button>
        </div>
      )}

      {contributions.length === 0 ? (
        <div className="no-contributions">
          <h3>No pending contributions</h3>
          <p>All contributions have been reviewed. Check back later for new submissions.</p>
        </div>
      ) : (
        <div className="contributions-list">
          {contributions.map((contribution) => (
            <div key={contribution._id} className="contribution-card">
              <div className="contribution-header">
                <div className="contribution-type-badge">
                  {contribution.type}
                </div>
                <div className="contribution-date">
                  {new Date(contribution.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="contribution-content">
                <div className="contribution-details">
                  <h3>
                    {contribution.type === 'Skill' ? contribution.data.skillName : 
                     contribution.type === 'Tool' ? contribution.data.toolName : 
                     'Contribution'}
                  </h3>
                  
                  <div className="contribution-meta">
                    {contribution.type === 'Skill' && (
                      <div className="meta-item">
                        <span className="meta-label">Category:</span> 
                        {contribution.data.category}
                      </div>
                    )}
                    {contribution.type === 'Tool' && (
                      <div className="meta-item">
                        <span className="meta-label">Category:</span>
                        {contribution.data.category}
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="meta-label">Contributor:</span>
                      {contribution.contributorEmail}
                    </div>
                  </div>
                  
                  <div className="contribution-description">
                    {contribution.type === 'Skill' && contribution.data.description ? 
                      contribution.data.description : 
                     contribution.type === 'Tool' && contribution.data.description ? 
                      contribution.data.description : 
                     "Additional data available"}
                  </div>
                </div>
              </div>
              
              <div className="review-section">
                <textarea
                  className="review-notes"
                  placeholder="Add review notes (optional)"
                  value={reviewNotes[contribution._id] || ""}
                  onChange={(e) => handleNotesChange(contribution._id, e.target.value)}
                ></textarea>
                
                <div className="review-actions">
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(contribution._id)}
                    disabled={actionLoading[contribution._id]}
                  >
                    {actionLoading[contribution._id] ? <Spinner /> : "Reject"}
                  </button>
                  <button 
                    className="approve-btn"
                    onClick={() => handleApprove(contribution._id)}
                    disabled={actionLoading[contribution._id]}
                  >
                    {actionLoading[contribution._id] ? <Spinner /> : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContributions; 