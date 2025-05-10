import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import SkillResources from './SkillResources';
import './SkillGapAnalysis.css';

const SkillGapAnalysis = () => {
  const { api, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [learningResources, setLearningResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  
  // Check authentication on mount and when currentUser changes
  useEffect(() => {
    setIsAuthenticated(currentUser !== null);
  }, [currentUser]);
  
  // Fetch user profile when authenticated
  useEffect(() => {
    let mounted = true;
    
    const fetchUserProfile = async () => {
      // Don't attempt to fetch if not authenticated
      if (!isAuthenticated) {
        return;
      }
      
      try {
        setLoading(true);
        const response = await api.get('/users/profile');
        
        if (response.data.status === 'success' && mounted) {
          const { targetRole, existingSkills } = response.data.data.user;
          setTargetRole(targetRole || '');
          setUserSkills(existingSkills || []);
          setError(null);
          
          // Fetch learning resources if target role exists
          if (targetRole) {
            fetchLearningResources(targetRole);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response && error.response.status === 401 && mounted) {
          setIsAuthenticated(false);
          setError('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
        } else if (mounted) {
          setError('Failed to load your profile. Please try again.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    fetchUserProfile();
    return () => { mounted = false; };
  }, [api, isAuthenticated]);
  
  // Fetch learning resources for a given target role
  const fetchLearningResources = async (role) => {
    if (!role) return;
    
    try {
      setResourcesLoading(true);
      const response = await api.get(`/learning/role/${encodeURIComponent(role)}`);
      
      if (response.data.status === 'success') {
        setLearningResources(response.data.data.resources);
      }
    } catch (error) {
      console.error('Error fetching learning resources:', error);
      // Don't show an error to the user - just log it
    } finally {
      setResourcesLoading(false);
    }
  };
  
  // Update target role
  const handleTargetRoleChange = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please log in to update your target role.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous recommended skills when updating target role
      setRecommendedSkills([]);
      
      const response = await api.put('/users/profile', {
        targetRole
      });
      
      if (response.data.status === 'success') {
        // Show success message
        alert('Target role updated successfully!');
        
        // Fetch learning resources for the new target role
        fetchLearningResources(targetRole);
        
        // Fetch recommended skills (this will happen automatically via useEffect)
      }
    } catch (error) {
      console.error('Error updating target role:', error);
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        setError('Failed to update target role. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Run analysis
  const handleRunAnalysis = async () => {
    if (!isAuthenticated) {
      setError('Please log in to run the analysis.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      
      if (!targetRole) {
        setError('Please set a target role before running the analysis.');
        setLoading(false);
        return;
      }
      
      // First, fetch the required skills for the role
      const response = await api.get(`/users/public/required-skills/${encodeURIComponent(targetRole)}`);
      
      if (response.data.status === 'success') {
        // Then get the skill gap analysis
        const gapResponse = await api.get('/users/analysis/skill-gap');
        
        if (gapResponse.data.status === 'success') {
          // Ensure all expected properties exist in the data
          const data = gapResponse.data.data;
          const requiredSkills = response.data.data.skills || [];
          
          const processedAnalysis = {
            targetRole: data.targetRole || targetRole,
            userSkills: data.userSkills || [],
            missingSkills: data.missingSkills || [],
            skillsToImprove: data.skillsToImprove || [],
            requiredSkills: requiredSkills,
            recommendations: data.recommendations || [],
            enhancedAnalysis: data.enhancedAnalysis || ''
          };
          setAnalysis(processedAnalysis);
          console.log('Analysis data:', processedAnalysis); // Debug log
        }
      }
    } catch (error) {
      console.error('Error running analysis:', error);
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
      } else {
        setError(error.response?.data?.message || 'Failed to run analysis. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Add skill to profile
  const handleAddSkill = async (skillName) => {
    if (!isAuthenticated) {
      setError('Please log in to add skills to your profile.');
      return;
    }
    
    try {
      // Case insensitive check if skill already exists in user profile
      const skillExists = userSkills.some(skill => 
        skill.skillName.toLowerCase() === skillName.toLowerCase()
      );
      
      if (skillExists) {
        alert(`You already have "${skillName}" in your profile!`);
        return;
      }
      
      setLoading(true); // Show loading state
      console.log(`Adding skill: ${skillName}`); // Debug
      
      const response = await api.patch('/users/skills', {
        skillName,
        proficiency: 'Beginner',
        status: 'Not Started'
      });
      
      if (response.data.status === 'success') {
        // Refresh user skills
        const profileResponse = await api.get('/users/profile');
        setUserSkills(profileResponse.data.data.user.existingSkills);
        alert(`Skill "${skillName}" added to your profile!`);
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      // Show detailed error information
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        alert(`Failed to add skill: ${error.response.data.message || 'Server error'}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Request made but no response received:', error.request);
        alert('Network error - no response from server. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
        alert(`Error: ${error.message}`);
      }
      
      if (error.response && error.response.status === 401) {
        setIsAuthenticated(false);
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle opening a resource in a new tab
  const handleOpenResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  // Handle showing resources for a specific skill
  const handleShowSkillResources = (skillName) => {
    setSelectedSkill(skillName === selectedSkill ? null : skillName);
  };
  
  // Fetch recommended skills when target role changes
  useEffect(() => {
    if (targetRole) {
      fetchRecommendedSkills();
    } else {
      setRecommendedSkills([]);
    }
  }, [targetRole]);
  
  // Add a function to fetch recommended skills
  const fetchRecommendedSkills = async () => {
    if (!targetRole) {
      setRecommendedSkills([]);
      return;
    }
    
    try {
      setResourcesLoading(true);
      setError(null);
      
      console.log(`Fetching recommended skills for: ${targetRole}`);
      const response = await api.get(`/users/public/required-skills/${encodeURIComponent(targetRole)}`);
      
      if (response.data.status === 'success') {
        const skills = response.data.data.skills || [];
        console.log(`Received ${skills.length} recommended skills for ${targetRole}`);
        setRecommendedSkills(skills);
      } else {
        setRecommendedSkills([]);
        setError('Failed to fetch recommended skills.');
      }
    } catch (error) {
      console.error('Error fetching recommended skills:', error);
      setRecommendedSkills([]);
      setError('Failed to fetch recommended skills. Please try again.');
    } finally {
      setResourcesLoading(false);
    }
  };
  
  // Display a login message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="skill-gap-analysis">
        <h2>Skill Gap Analysis</h2>
        <div className="auth-error">
          <p>{error || 'Please log in to access the Skill Gap Analysis feature.'}</p>
          <a href="/login" className="login-button">Log In</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="skill-gap-analysis">
      <h2>Skill Gap Analysis</h2>
      
      {/* Target Role Section */}
      <div className="target-role-section">
        <h3>Your Target Role</h3>
        <form onSubmit={handleTargetRoleChange}>
          <div className="form-group">
            <label htmlFor="targetRole">What role are you targeting?</label>
            <input
              type="text"
              id="targetRole"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Frontend Developer, Data Scientist"
              className="target-role-input"
            />
          </div>
          <button type="submit" disabled={loading} className="primary-button">
            {loading ? 'Updating...' : 'Update Target Role'}
          </button>
        </form>
      </div>
      
      {/* Required Skills for Role Section - Add before Learning Resources */}
      {recommendedSkills && recommendedSkills.length > 0 && (
        <div className="required-skills-overview">
          <h3>Skills Required for {targetRole}</h3>
          <p className="section-description">
            These key skills are recommended by AI for your target role:
            <span className="ai-badge">
              <img 
                src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/smart_toy/default/24px.svg"
                alt="AI"
                width="16"
                height="16"
              />
            </span>
          </p>
          
          <div className="skill-cards-container">
            {recommendedSkills.map((skill, index) => (
              <div key={index} className={`skill-card ${skill.importance?.toLowerCase() || ''}`}>
                <div className="skill-header">
                  <h4>{skill.skillName}</h4>
                  {skill.importance && (
                    <span className={`importance-badge ${skill.importance?.toLowerCase()}`}>
                      {skill.importance}
                    </span>
                  )}
                </div>
                <p className="skill-description">{skill.description || ''}</p>
                {skill.learningTimeMonths && (
                  <div className="learning-time">
                    <span className="time-icon">⏱️</span>
                    <span>~{skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'} to learn</span>
                  </div>
                )}
                <div className="skill-actions">
                  <button 
                    onClick={() => handleAddSkill(skill.skillName)}
                    className="primary-button"
                  >
                    Add to My Skills
                  </button>
                  <button 
                    onClick={() => handleShowSkillResources(skill.skillName)}
                    className="secondary-button"
                  >
                    Resources
                  </button>
                </div>
                {selectedSkill === skill.skillName && (
                  <div className="resource-container">
                    {SkillResources && typeof SkillResources === 'function' ? 
                      <SkillResources skillName={skill.skillName} /> : 
                      <p>Loading resources...</p>
                    }
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Learning Resources Section */}
      {learningResources.length > 0 && (
        <div className="learning-resources-section">
          <h3>Recommended Learning Resources</h3>
          <p>Here are some recommended courses and tutorials to help you become a {targetRole}:</p>
          
          <div className="resources-grid">
            {learningResources.map((resource, index) => (
              <div key={index} className="resource-card" onClick={() => handleOpenResource(resource.url)}>
                <div className="resource-thumbnail">
                  <img src={resource.thumbnail} alt={resource.title} />
                </div>
                <div className="resource-info">
                  <h4 className="resource-title">{resource.title}</h4>
                  <p className="resource-author">by {resource.author}</p>
                  <p className="resource-description">{resource.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {resourcesLoading && (
        <div className="resources-loading">
          <div className="loading-spinner"></div>
          <p>Loading recommended courses...</p>
        </div>
      )}
      
      {/* Your Skills Section */}
      <div className="your-skills-section">
        <h3>Your Skills</h3>
        {userSkills.length > 0 ? (
          <ul className="skills-list">
            {userSkills.map((skill, index) => (
              <li key={index} className="skill-item">
                <div className="skill-name">{skill.skillName}</div>
                <div className="skill-proficiency">
                  <span className={`badge badge-${skill.proficiency.toLowerCase()}`}>
                    {skill.proficiency}
                  </span>
                </div>
                <div className="skill-status">
                  <span className={`status status-${skill.status.toLowerCase().replace(' ', '-')}`}>
                    {skill.status}
                  </span>
                </div>
                <div className="skill-actions">
                  <button 
                    className="resources-btn"
                    onClick={() => handleShowSkillResources(skill.skillName)}
                  >
                    Resources
                  </button>
                </div>
                {selectedSkill === skill.skillName && (
                  <div>
                    {SkillResources && typeof SkillResources === 'function' ? 
                      <SkillResources skillName={skill.skillName} /> : 
                      <p>Loading resources...</p>
                    }
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="no-skills-yet">
            <p>No skills added yet. {targetRole ? `Here are recommended skills for ${targetRole}:` : 'Set your target role to see recommended skills.'}</p>
            
            {targetRole ? (
              <div className="recommended-skills">
                {loading ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading recommended skills...</p>
                  </div>
                ) : error ? (
                  <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchRecommendedSkills} className="retry-btn">
                      Retry
                    </button>
                  </div>
                ) : recommendedSkills && recommendedSkills.length > 0 ? (
                  <div className="skills-grid">
                    {recommendedSkills.map((skill, index) => {
                      // Case insensitive check if this skill is already in the user's profile
                      const alreadyHasSkill = userSkills.some(
                        userSkill => userSkill.skillName.toLowerCase() === skill.skillName.toLowerCase()
                      );
                      
                      return (
                        <div key={index} className={`skill-card ${skill.importance?.toLowerCase() || ''}`}>
                          <div className="skill-header">
                            <h5>{skill.skillName}</h5>
                            {skill.importance && (
                              <span className={`importance-badge ${skill.importance?.toLowerCase()}`}>
                                {skill.importance}
                              </span>
                            )}
                          </div>
                          <p className="skill-description">{skill.description || ''}</p>
                          {skill.learningTimeMonths && (
                            <div className="learning-time">
                              <span className="time-icon">⏱️</span>
                              <span>~{skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'} to learn</span>
                            </div>
                          )}
                          <div className="skill-actions">
                            {!alreadyHasSkill ? (
                              <button 
                                onClick={() => handleAddSkill(skill.skillName)}
                                disabled={loading}
                              >
                                {loading ? 'Adding...' : 'Add to My Skills'}
                              </button>
                            ) : (
                              <div className="already-skilled">
                                <span className="check-icon">✓</span> You're already skilled in this!
                              </div>
                            )}
                            <button 
                              className="resources-btn"
                              onClick={() => handleShowSkillResources(skill.skillName)}
                            >
                              Resources
                            </button>
                          </div>
                          {selectedSkill === skill.skillName && (
                            <div>
                              {SkillResources && typeof SkillResources === 'function' ? 
                                <SkillResources skillName={skill.skillName} /> : 
                                <p>Loading resources...</p>
                              }
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-recommendations">No specific skills found for this role. Try running a full analysis.</p>
                )}
              </div>
            ) : (
              <p className="hint">Set your target role above to see recommended skills.</p>
            )}
          </div>
        )}
      </div>
      
      {/* Analysis Results Section - Error handling improvement */}
      {error && (
        <div className="error-message-card">
          <div className="error-icon">❌</div>
          <div className="error-content">
            <h4>Analysis Failed</h4>
            <p>{error}</p>
            <button onClick={handleRunAnalysis} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      )}

      {!analysis && (
        <div className="analysis-cta">
          <div className="cta-content">
            <h3>Ready to analyze your skill gap?</h3>
            <p className="cta-description">
              Run a comprehensive analysis to identify missing skills, skills to improve, and personalized recommendations.
            </p>
            <button 
              onClick={handleRunAnalysis} 
              disabled={loading || !targetRole}
              className="cta-button"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Running Analysis...
                </>
              ) : (
                'Run Skill Gap Analysis'
              )}
            </button>
            {!targetRole && <p className="hint">Set your target role above to run the analysis.</p>}
          </div>
        </div>
      )}

      {analysis && (
        <div className="analysis-results">
          <h3>Skill Gap Analysis Results for {analysis.targetRole}</h3>
          
          {/* Required Skills Checklist */}
          <div className="analysis-section">
            <h4>Required Skills for {analysis.targetRole}</h4>
            <p className="section-description">Check the skills you already know to mark your progress.</p>
            
            {analysis.requiredSkills && analysis.requiredSkills.length > 0 ? (
              <div className="required-skills-checklist">
                {analysis.requiredSkills.map((skill, index) => {
                  // Case insensitive check if user already has this skill
                  const hasSkill = analysis.userSkills.some(
                    userSkill => userSkill.skillName.toLowerCase() === skill.skillName.toLowerCase()
                  );
                  
                  // Determine if this skill is in the missing skills list using case-insensitive comparison
                  const isMissing = analysis.missingSkills.some(
                    missingSkill => missingSkill.skillName.toLowerCase() === skill.skillName.toLowerCase()
                  );
                  
                  return (
                    <div key={index} className={`skill-card checklist ${skill.importance?.toLowerCase() || ''}`}>
                      <div className="skill-checkbox">
                        <input 
                          type="checkbox" 
                          id={`skill-${index}`} 
                          checked={hasSkill}
                          onChange={() => hasSkill ? 
                            alert(`You already have "${skill.skillName}" in your profile!`) : 
                            handleAddSkill(skill.skillName)
                          }
                        />
                        <label htmlFor={`skill-${index}`} className="skill-checkbox-label">
                          <span className="skill-name">{skill.skillName}</span>
                          {skill.importance && (
                            <span className={`importance-badge ${skill.importance?.toLowerCase()}`}>
                              {skill.importance}
                            </span>
                          )}
                        </label>
                      </div>
                      
                      <p className="skill-description">{skill.description}</p>
                      
                      {skill.learningTimeMonths && (
                        <div className="learning-time">
                          <span className="time-icon">⏱️</span>
                          <span>~{skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'} to learn</span>
                        </div>
                      )}
                      
                      <div className="skill-actions">
                        {!hasSkill && (
                          <button 
                            onClick={() => handleAddSkill(skill.skillName)}
                            disabled={loading}
                          >
                            {loading ? 'Adding...' : 'Add to My Skills'}
                          </button>
                        )}
                        {hasSkill && (
                          <div className="already-skilled">
                            <span className="check-icon">✓</span> You're already skilled in this!
                          </div>
                        )}
                        <button 
                          className="resources-btn"
                          onClick={() => handleShowSkillResources(skill.skillName)}
                        >
                          Learning Resources
                        </button>
                      </div>
                      
                      {selectedSkill === skill.skillName && (
                        <div className="skill-resources-expanded">
                          <h5>Recommended Learning Resources for {skill.skillName}</h5>
                          <div>
                            {SkillResources && typeof SkillResources === 'function' ? 
                              <SkillResources skillName={skill.skillName} /> : 
                              <p>Loading resources...</p>
                            }
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p>No required skills information available for this role.</p>
            )}
          </div>
          
          {/* Missing Skills */}
          <div className="analysis-section">
            <h4>Skills to Acquire</h4>
            <p className="section-description">These are the skills you need to learn for your target role.</p>
            
            {analysis.missingSkills.length === 0 ? (
              <p>No critical missing skills identified - great job!</p>
            ) : (
              <div className="skills-grid">
                {analysis.missingSkills.map((skill, index) => {
                  // Case insensitive check if this skill is already in the user's profile
                  const alreadyHasSkill = userSkills.some(
                    userSkill => userSkill.skillName.toLowerCase() === skill.skillName.toLowerCase()
                  );
                  
                  return (
                    <div key={index} className={`skill-card ${skill.importance?.toLowerCase() || ''}`}>
                      <div className="skill-header">
                        <h5>{skill.skillName}</h5>
                        {skill.importance && (
                          <span className={`importance-badge ${skill.importance?.toLowerCase()}`}>
                            {skill.importance}
                          </span>
                        )}
                      </div>
                      <p className="skill-description">{skill.description}</p>
                      {skill.learningTimeMonths && (
                        <div className="learning-time">
                          <span className="time-icon">⏱️</span>
                          <span>~{skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'} to learn</span>
                        </div>
                      )}
                      <div className="skill-actions">
                        {!alreadyHasSkill ? (
                          <button 
                            onClick={() => handleAddSkill(skill.skillName)}
                            disabled={loading}
                          >
                            {loading ? 'Adding...' : 'Add to My Skills'}
                          </button>
                        ) : (
                          <div className="already-skilled">
                            <span className="check-icon">✓</span> You're already skilled in this!
                          </div>
                        )}
                        <button 
                          className="resources-btn"
                          onClick={() => handleShowSkillResources(skill.skillName)}
                        >
                          Resources
                        </button>
                      </div>
                      {selectedSkill === skill.skillName && (
                        <div>
                          {SkillResources && typeof SkillResources === 'function' ? 
                            <SkillResources skillName={skill.skillName} /> : 
                            <p>Loading resources...</p>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Skills to Improve */}
          <div className="analysis-section">
            <h4>Skills to Improve</h4>
            <p className="section-description">You already have these skills, but should improve them for your target role.</p>
            
            {analysis.skillsToImprove.length === 0 ? (
              <p>No skills identified for improvement.</p>
            ) : (
              <div className="skills-grid">
                {analysis.skillsToImprove.map((skill, index) => {
                  const userSkill = analysis.userSkills.find(
                    us => us.skillName.toLowerCase() === skill.skillName.toLowerCase()
                  );
                  return (
                    <div key={index} className={`skill-card improvement ${skill.importance?.toLowerCase() || ''}`}>
                      <div className="skill-header">
                        <h5>{skill.skillName}</h5>
                        {skill.importance && (
                          <span className={`importance-badge ${skill.importance?.toLowerCase()}`}>
                            {skill.importance}
                          </span>
                        )}
                      </div>
                      <p className="skill-description">{skill.description}</p>
                      <div className="proficiency-info">
                        <div className="current-level">
                          <span className="level-label">Current:</span> 
                          <span className="level-value">{userSkill?.proficiency || 'Beginner'}</span>
                        </div>
                        <div className="target-level">
                          <span className="level-label">Target:</span> 
                          <span className="level-value">Advanced</span>
                        </div>
                      </div>
                      <div className="skill-actions">
                        <button 
                          className="resources-btn"
                          onClick={() => handleShowSkillResources(skill.skillName)}
                        >
                          Resources
                        </button>
                      </div>
                      {selectedSkill === skill.skillName && (
                        <div>
                          {SkillResources && typeof SkillResources === 'function' ? 
                            <SkillResources skillName={skill.skillName} /> : 
                            <p>Loading resources...</p>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* AI Enhanced Analysis */}
          {analysis.enhancedAnalysis && (
            <div className="enhanced-analysis">
              <h4>AI Career Guidance</h4>
              <div className="analysis-content">
                {analysis.enhancedAnalysis.split('\n\n').map((paragraph, i) => {
                  // Check if paragraph is a heading
                  if (paragraph.startsWith('##')) {
                    return <h3 key={i}>{paragraph.replace('##', '').trim()}</h3>;
                  } else if (paragraph.startsWith('#')) {
                    return <h4 key={i}>{paragraph.replace('#', '').trim()}</h4>;
                  } else if (paragraph.startsWith('###')) {
                    return <h5 key={i}>{paragraph.replace('###', '').trim()}</h5>;
                  } else if (paragraph.includes('**')) {
                    // Handle bold text with markdown ** syntax
                    return (
                      <p key={i} dangerouslySetInnerHTML={{
                        __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }} />
                    );
                  } else {
                    return <p key={i}>{paragraph}</p>;
                  }
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis; 