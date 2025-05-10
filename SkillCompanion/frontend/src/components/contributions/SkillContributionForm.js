import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SkillContributionForm = () => {
  const { api } = useAuth();
  const [formData, setFormData] = useState({
    skillName: '',
    category: '',
    demandLevel: 'Medium',
    growthRate: 'Steady',
    averageSalary: '',
    requiredExperience: '',
    descriptionKeywords: '',
    learningResources: '',
    relatedSkills: []
  });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [relatedSkill, setRelatedSkill] = useState('');

  const categories = [
    'Programming Languages',
    'Frameworks',
    'Databases',
    'DevOps',
    'Cloud',
    'Data Science',
    'Machine Learning',
    'Cybersecurity',
    'Design',
    'Other'
  ];

  const demandLevels = ['Low', 'Medium', 'High', 'Very High'];
  const growthRates = ['Declining', 'Slow', 'Steady', 'Rapid'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddRelatedSkill = () => {
    if (relatedSkill.trim() !== '' && !formData.relatedSkills.includes(relatedSkill.trim())) {
      setFormData({
        ...formData,
        relatedSkills: [...formData.relatedSkills, relatedSkill.trim()]
      });
      setRelatedSkill('');
    }
  };

  const handleRemoveRelatedSkill = (skill) => {
    setFormData({
      ...formData,
      relatedSkills: formData.relatedSkills.filter(s => s !== skill)
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
        type: 'Skill',
        data: formData,
        email
      });

      setSuccess(true);
      // Reset form
      setFormData({
        skillName: '',
        category: '',
        demandLevel: 'Medium',
        growthRate: 'Steady',
        averageSalary: '',
        requiredExperience: '',
        descriptionKeywords: '',
        learningResources: '',
        relatedSkills: []
      });
      setEmail('');
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to submit contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="skill-contribution-form">
      <h2>Contribute a New Skill</h2>
      <p>Share your knowledge about in-demand skills to help others in their career journey.</p>

      {error && <div className="alert error">{error}</div>}
      {success && <div className="alert success">Thank you for your contribution! It has been submitted for review.</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="skillName">Skill Name *</label>
          <input
            type="text"
            id="skillName"
            name="skillName"
            value={formData.skillName}
            onChange={handleChange}
            required
            placeholder="e.g. React.js"
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
            <label htmlFor="demandLevel">Demand Level</label>
            <select
              id="demandLevel"
              name="demandLevel"
              value={formData.demandLevel}
              onChange={handleChange}
            >
              {demandLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="growthRate">Growth Rate</label>
            <select
              id="growthRate"
              name="growthRate"
              value={formData.growthRate}
              onChange={handleChange}
            >
              {growthRates.map(rate => (
                <option key={rate} value={rate}>{rate}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="averageSalary">Average Salary Range</label>
          <input
            type="text"
            id="averageSalary"
            name="averageSalary"
            value={formData.averageSalary}
            onChange={handleChange}
            placeholder="e.g. $80,000 - $120,000"
          />
        </div>

        <div className="form-group">
          <label htmlFor="requiredExperience">Required Experience</label>
          <input
            type="text"
            id="requiredExperience"
            name="requiredExperience"
            value={formData.requiredExperience}
            onChange={handleChange}
            placeholder="e.g. 2-3 years of frontend development"
          />
        </div>

        <div className="form-group">
          <label htmlFor="descriptionKeywords">Skill Description Keywords *</label>
          <textarea
            id="descriptionKeywords"
            name="descriptionKeywords"
            value={formData.descriptionKeywords}
            onChange={handleChange}
            required
            placeholder="Enter keywords about this skill. Our AI will generate a description from these keywords."
            rows={4}
          />
        </div>

        <div className="form-group">
          <label htmlFor="learningResources">Learning Resources</label>
          <textarea
            id="learningResources"
            name="learningResources"
            value={formData.learningResources}
            onChange={handleChange}
            placeholder="Suggest books, courses, websites, or other resources to learn this skill."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="relatedSkill">Related Skills</label>
          <div className="input-with-button">
            <input
              type="text"
              id="relatedSkill"
              value={relatedSkill}
              onChange={e => setRelatedSkill(e.target.value)}
              placeholder="e.g. JavaScript"
            />
            <button type="button" onClick={handleAddRelatedSkill}>Add</button>
          </div>
          <div className="tags">
            {formData.relatedSkills.map(skill => (
              <span key={skill} className="tag">
                {skill}
                <button type="button" onClick={() => handleRemoveRelatedSkill(skill)}>×</button>
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

export default SkillContributionForm; 