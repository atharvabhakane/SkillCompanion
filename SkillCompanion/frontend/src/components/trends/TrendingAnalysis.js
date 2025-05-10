import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TrendingAnalysis.css';
import SkillTrendsVisualization from './SkillTrendsVisualization';
import './SkillTrendsVisualization.css';

const TrendingAnalysis = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trendingSkills, setTrendingSkills] = useState(null);
  const [trendingTools, setTrendingTools] = useState(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState('skills');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showVisualizations, setShowVisualizations] = useState(false);

  // Fetch trending data
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setLoading(true);
        
        // Fetch skills data
        const skillsResponse = await api.get('/trending/skills');
        if (skillsResponse.data.status === 'success') {
          setTrendingSkills(skillsResponse.data.data.trendingSkills || {
            topDemandSkills: [],
            topGrowthSkills: [],
            topSalarySkills: [],
            skillsByCategory: {}
          });
          
          // Set initial selected category if there are skills by category
          if (skillsResponse.data.data.trendingSkills && 
              skillsResponse.data.data.trendingSkills.skillsByCategory) {
            const categories = Object.keys(skillsResponse.data.data.trendingSkills.skillsByCategory);
            if (categories.length > 0) {
              setSelectedCategory(categories[0]);
            }
          }
        }
        
        // Fetch tools data
        const toolsResponse = await api.get('/trending/tools');
        console.log('Tools response:', toolsResponse.data);
        
        if (toolsResponse.data.status === 'success') {
          // Set default empty data structure if the response data is empty
          setTrendingTools(toolsResponse.data.data.trendingTools || {
            topGrowthTools: [],
            toolsByCategory: {}
          });
        }
        
        // Fetch enhanced analysis
        const analysisResponse = await api.get('/trending/enhanced-analysis');
        if (analysisResponse.data.status === 'success') {
          setEnhancedAnalysis(analysisResponse.data.data.enhancedAnalysis || '');
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setError('Failed to load trending analysis. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrendingData();
  }, [api]);

  // Handle category selection
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Toggle visualization mode
  const toggleVisualizations = () => {
    setShowVisualizations(!showVisualizations);
  };

  if (loading) {
    return (
      <div className="trending-analysis">
        <h2>Trending Analysis</h2>
        <div className="loading">Loading trending data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trending-analysis">
        <h2>Trending Analysis</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="trending-analysis">
      <div className="trending-header">
        <h2>Trending Analysis</h2>
        <button 
          className={`visualization-toggle-button ${showVisualizations ? 'active' : ''}`}
          onClick={toggleVisualizations}
        >
          {showVisualizations ? 'Show Standard View' : 'Show Interactive Visualizations'}
        </button>
      </div>
      
      {showVisualizations ? (
        // Interactive Visualizations View
        <SkillTrendsVisualization />
      ) : (
        // Standard View
        <>
          {/* Tabs for navigation */}
          <div className="trending-tabs">
            <button 
              className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              Trending Skills
            </button>
            <button 
              className={`tab-button ${activeTab === 'tools' ? 'active' : ''}`}
              onClick={() => setActiveTab('tools')}
            >
              Trending Tools
            </button>
            <button 
              className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              Industry Insights
            </button>
          </div>
          
          {/* Skills Tab Content */}
          {activeTab === 'skills' && trendingSkills && (
            <div className="trending-skills-content">
              <div className="skills-sections">
                <div className="skills-section">
                  <h3>Top In-Demand Skills</h3>
                  <ul className="trending-skills-list">
                    {trendingSkills.topDemandSkills.map((skill, index) => (
                      <li key={index} className="trending-skill-item">
                        <div className="skill-name">{skill.skillName}</div>
                        <div className="skill-meta">
                          <span className="demand-level">{skill.demandLevel} Demand</span>
                          {skill.growthRate && <span className="growth-rate">{skill.growthRate} Growth</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="skills-section">
                  <h3>Fastest Growing Skills</h3>
                  <ul className="trending-skills-list">
                    {trendingSkills.topGrowthSkills.map((skill, index) => (
                      <li key={index} className="trending-skill-item">
                        <div className="skill-name">{skill.skillName}</div>
                        <div className="skill-meta">
                          <span className="demand-level">{skill.demandLevel} Demand</span>
                          <span className="growth-rate">{skill.growthRate} Growth</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="skills-section">
                  <h3>Highest Salary Skills</h3>
                  <ul className="trending-skills-list">
                    {trendingSkills.topSalarySkills.map((skill, index) => (
                      <li key={index} className="trending-skill-item">
                        <div className="skill-name">{skill.skillName}</div>
                        <div className="skill-meta">
                          <span className="salary-info">{skill.averageSalary}</span>
                          <span className="demand-level">{skill.demandLevel} Demand</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="skills-by-category">
                <h3>Skills by Category</h3>
                <div className="category-selector">
                  {Object.keys(trendingSkills.skillsByCategory).map((category) => (
                    <button
                      key={category}
                      className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
                
                {selectedCategory && (
                  <div className="category-skills">
                    <h4>{selectedCategory} Skills</h4>
                    <ul className="trending-skills-list">
                      {trendingSkills.skillsByCategory[selectedCategory].map((skill, index) => (
                        <li key={index} className="trending-skill-item">
                          <div className="skill-name">{skill.skillName}</div>
                          <div className="skill-meta">
                            <span className="demand-level">{skill.demandLevel} Demand</span>
                            {skill.growthRate && <span className="growth-rate">{skill.growthRate} Growth</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Tools Tab Content */}
          {activeTab === 'tools' && trendingTools && (
            <div className="trending-tools-content">
              <div className="tools-section">
                <h3>Top Growing Tools</h3>
                {trendingTools.topGrowthTools && trendingTools.topGrowthTools.length > 0 ? (
                  <ul className="trending-tools-list">
                    {trendingTools.topGrowthTools.map((tool, index) => (
                      <li key={index} className="trending-tool-item">
                        <div className="tool-name">{tool.toolName}</div>
                        <div className="tool-meta">
                          <span className="category">{tool.category}</span>
                          <span className="growth-trend">{tool.growthTrend}</span>
                        </div>
                        <div className="tool-use-cases">
                          {tool.primaryUseCases}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-data-message">
                    <p>No trending tools data available at this time. Check back later for updates.</p>
                  </div>
                )}
              </div>
              
              <div className="tools-by-category">
                <h3>Tools by Category</h3>
                {trendingTools.toolsByCategory && Object.keys(trendingTools.toolsByCategory).length > 0 ? (
                  <>
                    <div className="category-selector">
                      {Object.keys(trendingTools.toolsByCategory).map((category) => (
                        <button
                          key={category}
                          className={`category-button ${selectedCategory === category ? 'active' : ''}`}
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                    
                    {selectedCategory && trendingTools.toolsByCategory[selectedCategory] && (
                      <div className="category-tools">
                        <h4>{selectedCategory} Tools</h4>
                        <ul className="trending-tools-list">
                          {trendingTools.toolsByCategory[selectedCategory].map((tool, index) => (
                            <li key={index} className="trending-tool-item">
                              <div className="tool-name">{tool.toolName}</div>
                              <div className="tool-meta">
                                <span className="category">{tool.category}</span>
                                <span className="growth-trend">{tool.growthTrend}</span>
                              </div>
                              <div className="tool-use-cases">
                                {tool.primaryUseCases}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-data-message">
                    <p>No tools by category data available at this time. Check back later for updates.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Insights Tab Content */}
          {activeTab === 'insights' && (
            <div className="industry-insights-content">
              <div className="insights-section">
                <h3>Industry Trends Analysis</h3>
                {enhancedAnalysis ? (
                  <div className="industry-analysis-content">
                    {enhancedAnalysis.split('\n\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    <p>No industry insights available at this time. Check back later for updates.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrendingAnalysis; 