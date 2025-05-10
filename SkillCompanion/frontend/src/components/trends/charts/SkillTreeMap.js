import React, { useState } from 'react';
import {
  Treemap,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const SkillTreeMap = ({ data, filters }) => {
  // State to track drill-down
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // If no data is provided, show a message
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skill category data available.</p>
      </div>
    );
  }
  
  // Prepare data for tree map
  const prepareTreeMapData = () => {
    if (selectedCategory) {
      // Drill down into selected category - show skills
      const categorySkills = data[selectedCategory] || [];
      
      // Filter skills by category/experience level if specified
      let filteredSkills = [...categorySkills];
      
      if (filters && filters.experienceLevel !== 'All') {
        filteredSkills = filteredSkills.filter(skill => 
          skill.requiredExperience === filters.experienceLevel
        );
      }
      
      // Convert filtered skills to tree map format
      return filteredSkills.map(skill => {
        // Calculate size based on demand level
        const demandValueMap = {
          'Very High': 4,
          'High': 3,
          'Medium': 2,
          'Low': 1
        };
        
        // Get salary as a number for sizing
        const salary = parseInt(skill.averageSalary?.replace(/[^0-9]/g, '') || '0');
        
        return {
          name: skill.skillName,
          size: demandValueMap[skill.demandLevel] || 1,
          demandLevel: skill.demandLevel,
          growthRate: skill.growthRate,
          salary: skill.averageSalary,
          salaryValue: salary,
          subcategory: skill.subcategory || 'General'
        };
      });
    } else {
      // Top level view - show categories
      return Object.keys(data).map(category => {
        // Count skills in category
        const skills = data[category];
        
        // Apply filters
        const filteredSkills = skills.filter(skill => {
          if (filters && filters.experienceLevel !== 'All') {
            return skill.requiredExperience === filters.experienceLevel;
          }
          return true;
        });
        
        // Skip empty categories after filtering
        if (filteredSkills.length === 0) {
          return null;
        }
        
        // Calculate average demand level
        const demandValueMap = {
          'Very High': 4,
          'High': 3,
          'Medium': 2,
          'Low': 1
        };
        
        const totalDemand = filteredSkills.reduce((sum, skill) => 
          sum + (demandValueMap[skill.demandLevel] || 0), 0);
        
        const avgDemand = filteredSkills.length > 0 ? 
          totalDemand / filteredSkills.length : 0;
        
        // Calculate average salary
        const totalSalary = filteredSkills.reduce((sum, skill) => {
          const salary = parseInt(skill.averageSalary?.replace(/[^0-9]/g, '') || '0');
          return sum + salary;
        }, 0);
        
        const avgSalary = filteredSkills.length > 0 ? 
          Math.round(totalSalary / filteredSkills.length) : 0;
        
        return {
          name: category,
          size: filteredSkills.length * avgDemand, // Size based on number of skills and demand
          children: [], // No children in top view
          skillCount: filteredSkills.length,
          avgDemand,
          avgSalary,
        };
      }).filter(Boolean); // Remove null entries
    }
  };
  
  // Handle category selection for drill-down
  const handleTreeMapClick = (data) => {
    if (!selectedCategory) {
      // Drill down into a category
      setSelectedCategory(data.name);
    } else {
      // Already drilled down, go back up
      setSelectedCategory(null);
    }
  };
  
  // Process tree map data
  const treeMapData = prepareTreeMapData();
  
  // If no data after filtering, show a message
  if (treeMapData.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skills match the selected filters.</p>
      </div>
    );
  }
  
  // Custom tooltip for the tree map
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (selectedCategory) {
        // Skill level tooltip
        return (
          <div className="custom-tooltip">
            <p className="tooltip-label">{data.name}</p>
            <p>Subcategory: <strong>{data.subcategory}</strong></p>
            <p>Demand Level: <strong>{data.demandLevel}</strong></p>
            <p>Growth Rate: <strong>{data.growthRate}</strong></p>
            <p>Average Salary: <strong>{data.salary}</strong></p>
          </div>
        );
      } else {
        // Category level tooltip
        return (
          <div className="custom-tooltip">
            <p className="tooltip-label">{data.name}</p>
            <p>Number of Skills: <strong>{data.skillCount}</strong></p>
            <p>Average Demand: <strong>
              {data.avgDemand < 1.5 ? 'Low' : 
               data.avgDemand < 2.5 ? 'Medium' : 
               data.avgDemand < 3.5 ? 'High' : 'Very High'}
            </strong></p>
            <p>Average Salary: <strong>${data.avgSalary.toLocaleString()}</strong></p>
            <p><em>Click to see skills in this category</em></p>
          </div>
        );
      }
    }
    
    return null;
  };
  
  // Color scales for demand levels
  const getDemandColor = (level) => {
    const demandColors = {
      'Very High': '#ff6b6b',
      'High': '#ffa06b',
      'Medium': '#ffd66b',
      'Low': '#a8c96b'
    };
    
    return demandColors[level] || '#aaaaaa';
  };
  
  // Get color for category based on average demand
  const getCategoryColor = (avgDemand) => {
    if (avgDemand >= 3.5) return '#ff6b6b'; // Very High
    if (avgDemand >= 2.5) return '#ffa06b'; // High
    if (avgDemand >= 1.5) return '#ffd66b'; // Medium
    return '#a8c96b'; // Low
  };
  
  return (
    <div className="treemap-container">
      <h3>
        {selectedCategory ? `Skills in ${selectedCategory} Category` : 'Skill Categories'} 
        {selectedCategory && (
          <button 
            className="back-button" 
            onClick={() => setSelectedCategory(null)}
          >
            Back to Categories
          </button>
        )}
      </h3>
      
      <div className="chart-info">
        <p>
          {selectedCategory ? 
            `This tree map shows skills within the ${selectedCategory} category. 
             Box size represents relative demand, and color indicates demand level.` :
            `This tree map organizes skills by category. Box size represents the 
             relative importance of each category in the job market.`
          }
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={600}>
        <Treemap
          data={treeMapData}
          dataKey="size"
          aspectRatio={4/3}
          stroke="#fff"
          fill="#8884d8"
          onClick={handleTreeMapClick}
          animationDuration={500}
          content={
            <CustomizedContent 
              selectedCategory={selectedCategory}
              getCategoryColor={getCategoryColor}
              getDemandColor={getDemandColor}
            />
          }
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="treemap-legend">
        <h4>Legend:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#ff6b6b' }}></div>
            <div className="legend-label">Very High Demand</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#ffa06b' }}></div>
            <div className="legend-label">High Demand</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#ffd66b' }}></div>
            <div className="legend-label">Medium Demand</div>
          </div>
          <div className="legend-item">
            <div className="color-box" style={{ backgroundColor: '#a8c96b' }}></div>
            <div className="legend-label">Low Demand</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Custom content component for Treemap
const CustomizedContent = (props) => {
  const { 
    root, depth, x, y, width, height, index, name, demandLevel, 
    selectedCategory, getCategoryColor, getDemandColor 
  } = props;
  
  // Skip rendering if dimensions are too small
  if (width < 1 || height < 1) {
    return null;
  }
  
  // Determine background color
  let fill;
  if (selectedCategory) {
    fill = getDemandColor(demandLevel);
  } else {
    const avgDemand = root.children[index].avgDemand;
    fill = getCategoryColor(avgDemand);
  }
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {(width > 50 && height > 25) ? (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={width > 100 ? 14 : 10}
          fill="#fff"
          style={{
            fontWeight: 'bold',
            textShadow: '1px 1px 1px rgba(0,0,0,0.5)',
            pointerEvents: 'none'
          }}
        >
          {name}
        </text>
      ) : null}
    </g>
  );
};

export default SkillTreeMap; 