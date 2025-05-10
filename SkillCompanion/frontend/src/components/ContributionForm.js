import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronRight, FaLightbulb, FaTools, FaGraduationCap } from 'react-icons/fa';

const ContributionForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'Skill',
    data: {},
    email: '',
    descriptionKeywords: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleTypeChange = (e) => {
    setFormData({
      ...formData,
      type: e.target.value,
      data: {} // Reset data when type changes
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested data properties
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Prepare submission data
      const submissionData = {
        type: formData.type,
        data: formData.data,
        email: formData.email
      };
      
      // Add description keywords if provided
      if (formData.descriptionKeywords.trim()) {
        submissionData.descriptionKeywords = formData.descriptionKeywords.trim();
      }
      
      // Call API to submit contribution
      const response = await fetch('/api/contributions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submissionData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit contribution');
      }
      
      // Success
      setSuccess(true);
      setFormData({
        type: 'Skill',
        data: {},
        email: '',
        descriptionKeywords: ''
      });
      
      // Navigate to success page after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your contribution');
    } finally {
      setLoading(false);
    }
  };
  
  // Render different form fields based on contribution type
  const renderTypeSpecificFields = () => {
    switch(formData.type) {
      case 'Skill':
        return (
          <>
            <div className="form-group">
              <label htmlFor="data.name">Skill Name</label>
              <input
                type="text"
                id="data.name"
                name="data.name"
                value={formData.data.name || ''}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="e.g. Python Programming"
              />
            </div>
            <div className="form-group">
              <label htmlFor="data.category">Category</label>
              <select
                id="data.category"
                name="data.category"
                value={formData.data.category || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select a category</option>
                <option value="Programming">Programming</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Machine Learning">Machine Learning</option>
                <option value="DevOps">DevOps</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </>
        );
        
      case 'Tool':
        return (
          <>
            <div className="form-group">
              <label htmlFor="data.name">Tool Name</label>
              <input
                type="text"
                id="data.name"
                name="data.name"
                value={formData.data.name || ''}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="e.g. Visual Studio Code"
              />
            </div>
            <div className="form-group">
              <label htmlFor="data.category">Category</label>
              <select
                id="data.category"
                name="data.category"
                value={formData.data.category || ''}
                onChange={handleInputChange}
                required
                className="form-control"
              >
                <option value="">Select a category</option>
                <option value="IDE">IDE</option>
                <option value="Framework">Framework</option>
                <option value="Library">Library</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="data.url">Tool URL (optional)</label>
              <input
                type="url"
                id="data.url"
                name="data.url"
                value={formData.data.url || ''}
                onChange={handleInputChange}
                className="form-control"
                placeholder="https://example.com"
              />
            </div>
          </>
        );
        
      case 'Idea':
        return (
          <>
            <div className="form-group">
              <label htmlFor="data.title">Idea Title</label>
              <input
                type="text"
                id="data.title"
                name="data.title"
                value={formData.data.title || ''}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="e.g. AI-powered code review assistant"
              />
            </div>
            <div className="form-group">
              <label htmlFor="data.problem">Problem It Solves</label>
              <textarea
                id="data.problem"
                name="data.problem"
                value={formData.data.problem || ''}
                onChange={handleInputChange}
                required
                className="form-control"
                placeholder="Describe the problem your idea solves..."
                rows="3"
              ></textarea>
            </div>
          </>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="contribution-form-container">
      <div className="form-header">
        <h2>Contribute to Our Community</h2>
        <p>Share your skills, tools, or ideas with other developers</p>
      </div>
      
      {success ? (
        <div className="success-message">
          <h3>Thank you for your contribution!</h3>
          <p>Your submission has been received and is being reviewed.</p>
          <p>Redirecting to home page...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="contribution-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="contributionType">Contribution Type</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.type === 'Skill' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="Skill"
                  checked={formData.type === 'Skill'}
                  onChange={handleTypeChange}
                />
                <FaGraduationCap className="radio-icon" />
                <span>Skill</span>
              </label>
              
              <label className={`radio-option ${formData.type === 'Tool' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="Tool"
                  checked={formData.type === 'Tool'}
                  onChange={handleTypeChange}
                />
                <FaTools className="radio-icon" />
                <span>Tool</span>
              </label>
              
              <label className={`radio-option ${formData.type === 'Idea' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="type"
                  value="Idea"
                  checked={formData.type === 'Idea'}
                  onChange={handleTypeChange}
                />
                <FaLightbulb className="radio-icon" />
                <span>Idea</span>
              </label>
            </div>
          </div>
          
          {/* Type-specific form fields */}
          {renderTypeSpecificFields()}
          
          <div className="form-group">
            <label htmlFor="descriptionKeywords">Description Keywords</label>
            <textarea
              id="descriptionKeywords"
              name="descriptionKeywords"
              value={formData.descriptionKeywords}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Enter keywords or phrases to help generate a description (e.g. 'modern javascript framework for building user interfaces')"
              rows="3"
            ></textarea>
            <small className="form-text">These keywords will be used to enhance the description of your contribution using AI. Separate with commas.</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Your Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-control"
              placeholder="your.email@example.com"
            />
            <small className="form-text">We'll use this to notify you about your contribution status.</small>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn-primary submit-btn" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Contribution'} 
              {!loading && <FaChevronRight className="btn-icon" />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContributionForm; 