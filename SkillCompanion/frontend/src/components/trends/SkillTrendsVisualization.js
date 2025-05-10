import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './TrendingAnalysis.css';
import './SkillTrendsVisualization.css';

// Chart components
import SkillRadarChart from './charts/SkillRadarChart';
import SkillHeatMap from './charts/SkillHeatMap';
import SkillTimelineChart from './charts/SkillTimelineChart';
import SkillSalaryImpactChart from './charts/SkillSalaryImpactChart';
import SkillTreeMap from './charts/SkillTreeMap';

const SkillTrendsVisualization = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [skillTrendsData, setSkillTrendsData] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);
  const [regionalSkillData, setRegionalSkillData] = useState(null);
  
  // UI states - simplified to just track active chart
  const [activeChart, setActiveChart] = useState('radar');
  
  // Simplified state - use defaults for all filters
  const selectedRole = 'R001'; // Default to Data Scientist role
  const selectedRegion = 'Global';
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch skill trends data
        const trendsResponse = await api.get('/trending/skill-trends');
        if (trendsResponse.data.status === 'success') {
          setSkillTrendsData(trendsResponse.data.data.skillTrendsData);
        }
        
        // Fetch skill gap data
        const gapResponse = await api.get('/trending/skill-gap');
        if (gapResponse.data.status === 'success') {
          setSkillGapData(gapResponse.data.data.skillGapData);
        }
        
        // Fetch regional skill data
        const regionalResponse = await api.get('/trending/regional-skill');
        if (regionalResponse.data.status === 'success') {
          setRegionalSkillData(regionalResponse.data.data.regionalSkillData);
        }
        
        setError(null);
      } catch (error) {
        console.error('Error fetching skill trends visualization data:', error);
        setError('Failed to load visualization data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [api]);
  
  // Loading state
  if (loading) {
    return (
      <div className="skill-trends-visualization">
        <h2>Skill Trends Dashboard</h2>
        <div className="loading">Loading visualization data...</div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="skill-trends-visualization">
        <h2>Skill Trends Dashboard</h2>
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  // No data state
  if (!skillTrendsData || !skillGapData || !regionalSkillData) {
    return (
      <div className="skill-trends-visualization">
        <h2>Skill Trends Dashboard</h2>
        <div className="no-data-message">No visualization data available.</div>
      </div>
    );
  }
  
  // Get selected role data
  const selectedRoleData = skillGapData.gapByRole[selectedRole] || null;
  
  return (
    <div className="skill-trends-visualization">
      <h2>Skill Trends Dashboard</h2>
      
      {/* Chart type selection - simplified UI */}
      <div className="chart-selection">
        <button 
          className={`chart-button ${activeChart === 'radar' ? 'active' : ''}`}
          onClick={() => setActiveChart('radar')}
        >
          Skill Gap Radar
        </button>
        <button 
          className={`chart-button ${activeChart === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveChart('heatmap')}
        >
          Regional Heat Map
        </button>
        <button 
          className={`chart-button ${activeChart === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveChart('timeline')}
        >
          Skill Timeline
        </button>
        <button 
          className={`chart-button ${activeChart === 'salaryimpact' ? 'active' : ''}`}
          onClick={() => setActiveChart('salaryimpact')}
        >
          Salary Impact
        </button>
        <button 
          className={`chart-button ${activeChart === 'treemap' ? 'active' : ''}`}
          onClick={() => setActiveChart('treemap')}
        >
          Category Tree Map
        </button>
      </div>
      
      {/* Chart display - with simplified filters object */}
      <div className="chart-container">
        {activeChart === 'radar' && selectedRoleData && (
          <SkillRadarChart 
            data={selectedRoleData} 
            filters={{category: 'All'}}
          />
        )}
        
        {activeChart === 'heatmap' && (
          <SkillHeatMap 
            data={regionalSkillData} 
            selectedRegion={selectedRegion}
            filters={{category: 'All'}}
          />
        )}
        
        {activeChart === 'timeline' && (
          <SkillTimelineChart 
            data={skillTrendsData.skillsTimeline} 
            filters={{category: 'All'}}
          />
        )}
        
        {activeChart === 'salaryimpact' && (
          <SkillSalaryImpactChart 
            data={skillGapData.impactOnSalary}
            skillsData={skillTrendsData.allSkills}
            filters={{category: 'All'}}
          />
        )}
        
        {activeChart === 'treemap' && (
          <SkillTreeMap 
            data={skillTrendsData.skillsByCategory}
            filters={{category: 'All'}}
          />
        )}
      </div>
      
      {/* Chart explanation */}
      <div className="chart-explanation">
        {activeChart === 'radar' && (
          <div className="explanation-box">
            <h3>Skill Gap Analysis</h3>
            <p>
              The radar chart compares required proficiency levels for key skills in the selected role
              against average user proficiency. Larger gaps indicate areas where additional learning
              would have the most impact.
            </p>
          </div>
        )}
        
        {activeChart === 'heatmap' && (
          <div className="explanation-box">
            <h3>Regional Demand Heat Map</h3>
            <p>
              The heat map displays skill demand intensity across different geographic regions.
              Darker colors indicate higher demand for that skill in the selected region.
            </p>
          </div>
        )}
        
        {activeChart === 'timeline' && (
          <div className="explanation-box">
            <h3>Skill Demand Timeline</h3>
            <p>
              This chart shows projected demand for selected skills over time.
              The trend lines indicate how demand is expected to evolve in coming quarters.
            </p>
          </div>
        )}
        
        {activeChart === 'salaryimpact' && (
          <div className="explanation-box">
            <h3>Salary Impact Analysis</h3>
            <p>
              This chart displays the estimated salary impact of acquiring different skills.
              Taller bars indicate skills that tend to have a greater positive effect on compensation.
            </p>
          </div>
        )}
        
        {activeChart === 'treemap' && (
          <div className="explanation-box">
            <h3>Skill Category Tree Map</h3>
            <p>
              The tree map organizes skills by category and subcategory, with box size indicating
              relative importance or demand. This visualization helps identify which skill areas
              are most dominant in the current job market.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillTrendsVisualization; 