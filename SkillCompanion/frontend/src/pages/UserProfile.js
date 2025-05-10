import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    targetRole: '',
    existingSkills: []
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    targetRole: '',
    existingSkills: []
  });
  const [newSkill, setNewSkill] = useState({
    skillName: '',
    proficiency: 'Beginner'
  });

  // Proficiency options
  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced'];

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.status === 'success') {
          const userData = response.data.data.user;
          setUser(userData);
          setFormData({
            username: userData.username,
            targetRole: userData.targetRole || '',
            existingSkills: userData.existingSkills || []
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load profile. Please try again later.');
        
        // Handle unauthorized access
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle new skill input changes
  const handleSkillInputChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle existing skill changes
  const handleSkillChange = (index, field, value) => {
    const updatedSkills = [...formData.existingSkills];
    updatedSkills[index] = {
      ...updatedSkills[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      existingSkills: updatedSkills
    }));
  };

  // Add a new skill
  const handleAddSkill = () => {
    if (!newSkill.skillName.trim()) return;
    
    // Check if skill already exists
    const skillExists = formData.existingSkills.some(
      skill => skill.skillName.toLowerCase() === newSkill.skillName.toLowerCase()
    );
    
    if (skillExists) {
      setError('This skill is already in your list.');
      return;
    }

    setFormData(prev => ({
      ...prev,
      existingSkills: [
        ...prev.existingSkills,
        {
          skillName: newSkill.skillName,
          proficiency: newSkill.proficiency,
          status: 'Not Started',
          notes: ''
        }
      ]
    }));

    // Reset new skill form
    setNewSkill({
      skillName: '',
      proficiency: 'Beginner'
    });
    
    setError(null);
  };

  // Remove a skill
  const handleRemoveSkill = (index) => {
    const updatedSkills = [...formData.existingSkills];
    updatedSkills.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      existingSkills: updatedSkills
    }));
  };

  // Submit profile changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.put('/api/users/profile', 
        {
          existingSkills: formData.existingSkills,
          targetRole: formData.targetRole
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setUser(response.data.data.user);
        setSuccess(true);
        setEditMode(false);
        
        // Display success message briefly
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
      
      // Handle unauthorized access
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      username: user.username,
      targetRole: user.targetRole || '',
      existingSkills: user.existingSkills || []
    });
    setEditMode(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        {!editMode && (
          <button 
            className="edit-profile-btn"
            onClick={() => setEditMode(true)}
          >
            Edit Profile
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Profile updated successfully!</div>}

      <div className="profile-content">
        {/* View Mode */}
        {!editMode ? (
          <div className="profile-view">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="profile-info">
                <div className="info-item">
                  <label>Username:</label>
                  <span>{user.username}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{user.email}</span>
                </div>
                <div className="info-item">
                  <label>Target Role:</label>
                  <span>{user.targetRole || 'Not set'}</span>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h2>My Skills</h2>
              {user.existingSkills && user.existingSkills.length > 0 ? (
                <div className="skills-list">
                  {user.existingSkills.map((skill, index) => (
                    <div className="skill-card" key={index}>
                      <div className="skill-header">
                        <h3 className="skill-name">{skill.skillName}</h3>
                        <span className={`proficiency-badge ${skill.proficiency.toLowerCase()}`}>
                          {skill.proficiency}
                        </span>
                      </div>
                      <div className="skill-details">
                        <div className="skill-info">
                          <label>Status:</label>
                          <span>{skill.status}</span>
                        </div>
                        {skill.notes && (
                          <div className="skill-info">
                            <label>Notes:</label>
                            <span>{skill.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-skills">You haven't added any skills yet.</p>
              )}
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSubmit} className="profile-edit-form">
            <div className="profile-section">
              <h2>Personal Information</h2>
              <div className="form-group">
                <label htmlFor="username">Username:</label>
                <span>{user.username}</span>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="form-group">
                <label htmlFor="targetRole">Target Role:</label>
                <input
                  type="text"
                  id="targetRole"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleInputChange}
                  placeholder="e.g. Full Stack Developer"
                />
              </div>
            </div>

            <div className="profile-section">
              <h2>My Skills</h2>
              
              {/* Existing Skills */}
              {formData.existingSkills && formData.existingSkills.length > 0 ? (
                <div className="skills-edit-list">
                  {formData.existingSkills.map((skill, index) => (
                    <div className="skill-edit-card" key={index}>
                      <div className="skill-edit-header">
                        <h3 className="skill-name">{skill.skillName}</h3>
                        <button 
                          type="button" 
                          className="remove-skill-btn"
                          onClick={() => handleRemoveSkill(index)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="skill-edit-details">
                        <div className="form-group">
                          <label>Proficiency:</label>
                          <select
                            value={skill.proficiency}
                            onChange={(e) => handleSkillChange(index, 'proficiency', e.target.value)}
                          >
                            {proficiencyLevels.map(level => (
                              <option key={level} value={level}>{level}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Status:</label>
                          <select
                            value={skill.status}
                            onChange={(e) => handleSkillChange(index, 'status', e.target.value)}
                          >
                            <option value="Not Started">Not Started</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Notes:</label>
                          <textarea
                            value={skill.notes || ''}
                            onChange={(e) => handleSkillChange(index, 'notes', e.target.value)}
                            placeholder="Add notes about your experience with this skill"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-skills">You haven't added any skills yet.</p>
              )}
              
              {/* Add New Skill */}
              <div className="add-skill-section">
                <h3>Add a New Skill</h3>
                <div className="add-skill-form">
                  <div className="form-group">
                    <label htmlFor="skillName">Skill Name:</label>
                    <input
                      type="text"
                      id="skillName"
                      name="skillName"
                      value={newSkill.skillName}
                      onChange={handleSkillInputChange}
                      placeholder="e.g. JavaScript"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="proficiency">Proficiency:</label>
                    <select
                      id="proficiency"
                      name="proficiency"
                      value={newSkill.proficiency}
                      onChange={handleSkillInputChange}
                    >
                      {proficiencyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="button" 
                    className="add-skill-btn"
                    onClick={handleAddSkill}
                  >
                    Add Skill
                  </button>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-profile-btn">Save Changes</button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile; 