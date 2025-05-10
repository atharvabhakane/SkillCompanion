import React, { useState } from 'react';
import { ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Treemap, Cell } from 'recharts';

const SkillHeatMap = ({ data }) => {
  const [activeSkill, setActiveSkill] = useState(null);
  
  // If no data is provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skill data available for heat map.</p>
      </div>
    );
  }
  
  // Get the top 20 skills by demand score
  const topSkills = data
    .sort((a, b) => b.demandScore - a.demandScore)
    .slice(0, 20);
    
  // Prepare data for Treemap visualization
  const transformDataForTreemap = () => {
    // Group skills by category
    const categories = {};
    
    topSkills.forEach(skill => {
      const category = skill.category || 'Other';
      
      if (!categories[category]) {
        categories[category] = {
          name: category,
          children: []
        };
      }
      
      // Adjust size based on demand score (scaled up for better visibility)
      categories[category].children.push({
        name: skill.skillName,
        size: skill.demandScore * 100,
        demandScore: skill.demandScore,
        salaryImpact: skill.salaryImpact || 0,
        jobPostings: skill.jobPostings || 0,
        originalSkill: skill
      });
    });
    
    // Convert to array format required by Treemap
    return {
      name: 'Skills',
      children: Object.values(categories)
    };
  };
  
  const renderCustomizedLabel = (props) => {
    const { x, y, width, height, name, demandScore } = props;
    
    // Only show labels for cells that are big enough
    if (width < 50 || height < 30) return null;
    
    return (
      <g>
        <text
          x={x + width / 2}
          y={y + height / 2 - 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={12}
          fontWeight="bold"
        >
          {name}
        </text>
        <text
          x={x + width / 2}
          y={y + height / 2 + 8}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={10}
        >
          {demandScore.toFixed(1)}
        </text>
      </g>
    );
  };
  
  // Color scale based on demand score
  const getSkillColor = (demandScore) => {
    // Color gradient from cooler to warmer colors based on demand
    if (demandScore >= 9) return "#d73027"; // Very high - red
    if (demandScore >= 8) return "#f46d43"; // High - orange
    if (demandScore >= 7) return "#fdae61"; // Above average - light orange
    if (demandScore >= 6) return "#fee08b"; // Slightly above average - yellow
    if (demandScore >= 5) return "#d9ef8b"; // Average - light green
    if (demandScore >= 4) return "#a6d96a"; // Below average - green
    if (demandScore >= 3) return "#66bd63"; // Low - darker green
    return "#1a9850"; // Very low - deep green
  };
  
  // Custom tooltip for treemap
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <h4>{data.name}</h4>
          <p><strong>Demand Score:</strong> {data.demandScore.toFixed(1)}</p>
          <p><strong>Salary Impact:</strong> {data.salaryImpact ? `$${data.salaryImpact.toLocaleString()}` : 'N/A'}</p>
          <p><strong>Job Postings:</strong> {data.jobPostings ? data.jobPostings.toLocaleString() : 'N/A'}</p>
          <p><strong>Category:</strong> {data.parent}</p>
        </div>
      );
    }
    return null;
  };
  
  // When a user clicks on a cell
  const handleClick = (data) => {
    setActiveSkill(data.originalSkill);
  };
  
  const treeMapData = transformDataForTreemap();
  
  return (
    <div className="heatmap-container">
      <h3>Skill Demand Heat Map</h3>
      <p className="chart-description">
        This heat map shows the most in-demand skills, with color intensity representing demand level.
        Larger boxes indicate higher demand scores. Click on any skill for more details.
      </p>
      
      <div className="heatmap-and-details">
        <div className="heatmap-visualization">
          <ResponsiveContainer width="100%" height={450}>
            <Treemap
              data={treeMapData}
              dataKey="size"
              ratio={4/3}
              stroke="#fff"
              fill="#8884d8"
              onClick={handleClick}
              animationDuration={500}
              content={renderCustomizedLabel}
            >
              <Tooltip content={<CustomTooltip />} />
              {treeMapData.children.map((category) => 
                category.children.map((skill, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getSkillColor(skill.demandScore)}
                    name={skill.name}
                    demandScore={skill.demandScore}
                    parent={category.name}
                  />
                ))
              )}
            </Treemap>
          </ResponsiveContainer>
        </div>
        
        {activeSkill && (
          <div className="skill-details-panel">
            <h4>{activeSkill.skillName}</h4>
            <div className="skill-detail">
              <span className="label">Demand Score:</span>
              <span className="value">{activeSkill.demandScore.toFixed(1)}</span>
            </div>
            <div className="skill-detail">
              <span className="label">Category:</span>
              <span className="value">{activeSkill.category || 'Not Specified'}</span>
            </div>
            <div className="skill-detail">
              <span className="label">Salary Impact:</span>
              <span className="value">
                {activeSkill.salaryImpact 
                  ? `$${activeSkill.salaryImpact.toLocaleString()}` 
                  : 'Not Available'}
              </span>
            </div>
            <div className="skill-detail">
              <span className="label">Job Postings:</span>
              <span className="value">
                {activeSkill.jobPostings 
                  ? activeSkill.jobPostings.toLocaleString() 
                  : 'Not Available'}
              </span>
            </div>
            <div className="skill-detail">
              <span className="label">Growth Trend:</span>
              <span className="value">
                {activeSkill.growthPercent 
                  ? `${activeSkill.growthPercent}%` 
                  : 'Not Available'}
              </span>
            </div>
            <div className="close-panel" onClick={() => setActiveSkill(null)}>
              ×
            </div>
          </div>
        )}
      </div>
      
      <div className="color-legend">
        <div className="legend-item">
          <div className="color-box" style={{backgroundColor: '#1a9850'}}></div>
          <span>Low Demand (0-3)</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{backgroundColor: '#a6d96a'}}></div>
          <span>Below Average (4-5)</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{backgroundColor: '#fdae61'}}></div>
          <span>Above Average (6-7)</span>
        </div>
        <div className="legend-item">
          <div className="color-box" style={{backgroundColor: '#d73027'}}></div>
          <span>High Demand (8-10)</span>
        </div>
      </div>
    </div>
  );
};

export default SkillHeatMap; 