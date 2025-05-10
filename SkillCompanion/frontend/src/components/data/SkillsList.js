import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const SkillsList = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { api } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/skills';
        if (selectedCategory) {
          url = `/skills/category/${selectedCategory}`;
        }
        
        const response = await api.get(url);
        
        setSkills(response.data.data.skills);
        
        // Extract unique categories if not already done
        if (categories.length === 0) {
          const uniqueCategories = [...new Set(response.data.data.skills.map(skill => skill.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkills();
  }, [api, selectedCategory, categories.length]);
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  if (loading) {
    return <div>Loading skills data...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="skills-list">
      <h2>Skills Database</h2>
      
      <div className="filter-controls">
        <label htmlFor="category-filter">Filter by Category:</label>
        <select 
          id="category-filter" 
          value={selectedCategory} 
          onChange={handleCategoryChange}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      {skills.length === 0 ? (
        <p>No skills found for the selected criteria.</p>
      ) : (
        <div className="skills-grid">
          {skills.map(skill => (
            <div key={skill.skillId} className="skill-card">
              <h3>{skill.skillName}</h3>
              <p><strong>Category:</strong> {skill.category}</p>
              <p><strong>Demand Level:</strong> {skill.demandLevel}</p>
              <p><strong>Growth Rate:</strong> {skill.growthRate}</p>
              {skill.learningResources && (
                <p className="resources">
                  <strong>Resources:</strong> {skill.learningResources}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsList; 