import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const ToolsList = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const { api } = useContext(AuthContext);
  
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = '/tools';
        if (selectedCategory) {
          url = `/tools/category/${selectedCategory}`;
        }
        
        const response = await api.get(url);
        
        setTools(response.data.data.tools);
        
        // Extract unique categories if not already done
        if (categories.length === 0) {
          const uniqueCategories = [...new Set(response.data.data.tools.map(tool => tool.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
        setError('Failed to load tools data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, [api, selectedCategory, categories.length]);
  
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };
  
  if (loading) {
    return <div>Loading tools data...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  return (
    <div className="tools-list">
      <h2>Tools Database</h2>
      
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
      
      {tools.length === 0 ? (
        <p>No tools found for the selected criteria.</p>
      ) : (
        <div className="tools-grid">
          {tools.map(tool => (
            <div key={tool.toolId} className="tool-card">
              <h3>{tool.toolName}</h3>
              <p><strong>Category:</strong> {tool.category}</p>
              <p><strong>Primary Uses:</strong> {tool.primaryUseCases}</p>
              <p><strong>Skill Level Required:</strong> {tool.skillLevelRequired}</p>
              <p><strong>Growth Trend:</strong> {tool.growthTrend}</p>
              {tool.pricingModel && (
                <p><strong>Pricing:</strong> {tool.pricingModel}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolsList; 