import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const ToolContributionForm = () => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    toolName: '',
    category: '',
    descriptionKeywords: '',
    skillLevelRequired: 'Beginner',
    pricingModel: '',
    integrationCapabilities: '',
    relevantIndustries: [],
    growthTrend: 'Stable'
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [industry, setIndustry] = useState('');

  const categories = [
    'Development',
    'Design',
    'Testing',
    'Data Analysis',
    'Project Management',
    'DevOps',
    'Collaboration',
    'Marketing',
    'Security',
    'Other'
  ];

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const growthTrends = ['Declining', 'Stable', 'Growing', 'Rapidly Growing'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddIndustry = () => {
    if (industry.trim() !== '' && !formData.relevantIndustries.includes(industry.trim())) {
      setFormData({
        ...formData,
        relevantIndustries: [...formData.relevantIndustries, industry.trim()]
      });
      setIndustry('');
    }
  };

  const handleRemoveIndustry = (industry) => {
    setFormData({
      ...formData,
      relevantIndustries: formData.relevantIndustries.filter(i => i !== industry)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Submit contribution
      await api.post('/contributions/submit', {
        type: 'Tool',
        data: formData,
        email
      });

      setSuccess(true);
      // Reset form
      setFormData({
        toolName: '',
        category: '',
        descriptionKeywords: '',
        skillLevelRequired: 'Beginner',
        pricingModel: '',
        integrationCapabilities: '',
        relevantIndustries: [],
        growthTrend: 'Stable'
      });
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to submit contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-contribution-form">
      <h2>Contribute a New Tool</h2>
      <p>Share your knowledge about useful tech tools to help others improve their workflow.</p>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">Thank you for your contribution! It has been submitted for review.</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="toolName">Tool Name *</label>
          <input
            type="text"
            id="toolName"
            name="toolName"
            value={formData.toolName}
            onChange={handleChange}
            required
            placeholder="e.g. Visual Studio Code"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="skillLevelRequired">Required Skill Level</label>
            <select
              id="skillLevelRequired"
              name="skillLevelRequired"
              value={formData.skillLevelRequired}
              onChange={handleChange}
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="growthTrend">Growth Trend</label>
            <select
              id="growthTrend"
              name="growthTrend"
              value={formData.growthTrend}
              onChange={handleChange}
            >
              {growthTrends.map(trend => (
                <option key={trend} value={trend}>{trend}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="pricingModel">Pricing Model</label>
          <input
            type="text"
            id="pricingModel"
            name="pricingModel"
            value={formData.pricingModel}
            onChange={handleChange}
            placeholder="e.g. Free, Freemium, Paid ($10/month)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="integrationCapabilities">Integration Capabilities</label>
          <input
            type="text"
            id="integrationCapabilities"
            name="integrationCapabilities"
            value={formData.integrationCapabilities}
            onChange={handleChange}
            placeholder="e.g. Integrates with GitHub, JIRA, Slack"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descriptionKeywords">Tool Description Keywords *</label>
          <textarea
            id="descriptionKeywords"
            name="descriptionKeywords"
            value={formData.descriptionKeywords}
            onChange={handleChange}
            required
            placeholder="Enter keywords about this tool's primary use cases. Our AI will generate a description from these keywords."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="industry">Relevant Industries</label>
          <div className="input-with-button">
            <input
              type="text"
              id="industry"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              placeholder="e.g. Web Development"
            />
            <button type="button" onClick={handleAddIndustry}>Add</button>
          </div>
          <div className="tags">
            {formData.relevantIndustries.map(industry => (
              <span key={industry} className="tag">
                {industry}
                <button type="button" onClick={() => handleRemoveIndustry(industry)}>×</button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email *</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            placeholder="We'll notify you when your contribution is reviewed"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Contribution'}
        </button>
      </form>
    </div>
  );
};

export default ToolContributionForm; 