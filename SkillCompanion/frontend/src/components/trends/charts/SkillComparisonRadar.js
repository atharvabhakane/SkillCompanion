import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';

const SkillComparisonRadar = ({ data }) => {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const MAX_SKILLS = 4; // Maximum number of skills to compare
  
  // Colors for different skills
  const skillColors = [
    "#8884d8", // purple
    "#82ca9d", // green
    "#ff7300", // orange
    "#0088fe", // blue
  ];
  
  // Initialize available skills when data changes
  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Sort skills by demand score for the selection list
    const sortedSkills = [...data].sort((a, b) => b.demandScore - a.demandScore);
    setAvailableSkills(sortedSkills);
    
    // Auto-select top 3 skills if none are selected
    if (selectedSkills.length === 0) {
      setSelectedSkills(sortedSkills.slice(0, 3).map(skill => skill.skillName));
    }
  }, [data]);
  
  // Update radar data when selected skills change
  useEffect(() => {
    if (!data || data.length === 0 || selectedSkills.length === 0) return;
    
    // Find the selected skill objects
    const selectedSkillObjects = data.filter(skill => 
      selectedSkills.includes(skill.skillName)
    );
    
    // Create radar data structure
    const metrics = [
      { name: 'Demand', key: 'demandScore', fullMark: 10 },
      { name: 'Growth', key: 'growthPercent', fullMark: 100 },
      { name: 'Salary Impact', key: 'salaryImpact', fullMark: 120000 },
      { name: 'Learning Difficulty', key: 'learningDifficulty', fullMark: 10 },
      { name: 'Job Postings', key: 'jobPostings', fullMark: 10000 }
    ];
    
    // Transform data for radar chart
    const transformedData = metrics.map(metric => {
      const dataPoint = { metric: metric.name };
      
      selectedSkillObjects.forEach(skill => {
        // Handle different metrics differently
        let value = skill[metric.key] || 0;
        
        // Normalize values between 0-100 for better visualization
        if (metric.key === 'demandScore') {
          // Demand score is typically 0-10, scale to 0-100
          value = (value / 10) * 100;
        } else if (metric.key === 'salaryImpact') {
          // Salary impact is typically 0-120000, scale to 0-100
          value = (value / 120000) * 100;
        } else if (metric.key === 'jobPostings') {
          // Job postings could be large numbers, cap at 10000 and scale
          value = Math.min(value, 10000) / 100;
        } else if (metric.key === 'learningDifficulty') {
          // Learning difficulty is typically 0-10, scale to 0-100
          value = (value / 10) * 100;
        } else if (metric.key === 'growthPercent') {
          // Growth is already a percentage, but cap at 100
          value = Math.min(value, 100);
        }
        
        dataPoint[skill.skillName] = Math.round(value);
      });
      
      return dataPoint;
    });
    
    setRadarData(transformedData);
  }, [data, selectedSkills]);
  
  // Toggle skill selection
  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setSelectedSkills(selectedSkills.filter(name => name !== skillName));
    } else if (selectedSkills.length < MAX_SKILLS) {
      setSelectedSkills([...selectedSkills, skillName]);
    }
  };
  
  // If no data is provided, show a placeholder
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skill data available for comparison.</p>
      </div>
    );
  }
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const metric = payload[0].payload.metric;
      
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{metric}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {getOriginalValue(entry.value, metric)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Function to convert normalized values back to original format for tooltip
  const getOriginalValue = (value, metricName) => {
    switch (metricName) {
      case 'Demand':
        return ((value / 100) * 10).toFixed(1) + ' / 10';
      case 'Growth':
        return value.toFixed(1) + '%';
      case 'Salary Impact':
        return '$' + ((value / 100) * 120000).toLocaleString();
      case 'Learning Difficulty':
        return ((value / 100) * 10).toFixed(1) + ' / 10';
      case 'Job Postings':
        return (value * 100).toLocaleString();
      default:
        return value;
    }
  };
  
  return (
    <div className="skill-radar-container">
      <h3>Skill Comparison Radar</h3>
      <p className="chart-description">
        Compare skills across multiple dimensions. Select up to 4 skills to visualize their strengths and weaknesses.
      </p>
      
      <div className="skill-selector">
        <p>Select skills to compare ({selectedSkills.length}/{MAX_SKILLS}):</p>
        <div className="skill-button-container">
          {availableSkills.slice(0, 10).map((skill, index) => (
            <button
              key={index}
              className={`skill-button ${selectedSkills.includes(skill.skillName) ? 'selected' : ''}`}
              onClick={() => toggleSkill(skill.skillName)}
              disabled={!selectedSkills.includes(skill.skillName) && selectedSkills.length >= MAX_SKILLS}
              style={selectedSkills.includes(skill.skillName) ? 
                { borderColor: skillColors[selectedSkills.indexOf(skill.skillName)] } : {}}
            >
              {skill.skillName}
            </button>
          ))}
        </div>
      </div>
      
      {selectedSkills.length > 0 && radarData.length > 0 ? (
        <ResponsiveContainer width="100%" height={500}>
          <RadarChart outerRadius="80%" data={radarData}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="metric" tick={{ fill: '#666', fontSize: 14 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            
            {selectedSkills.map((skillName, index) => (
              <Radar
                key={skillName}
                name={skillName}
                dataKey={skillName}
                stroke={skillColors[index]}
                fill={skillColors[index]}
                fillOpacity={0.3}
              />
            ))}
            
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ paddingTop: 20 }}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : (
        <div className="chart-placeholder">
          <p>Please select at least one skill to visualize.</p>
        </div>
      )}
      
      <div className="radar-metrics-explanation">
        <h4>Metrics Explained</h4>
        <ul>
          <li><strong>Demand:</strong> Overall market demand score (0-10)</li>
          <li><strong>Growth:</strong> Year-over-year percentage growth in demand</li>
          <li><strong>Salary Impact:</strong> Estimated salary premium associated with the skill</li>
          <li><strong>Learning Difficulty:</strong> Estimated difficulty to learn (0-10)</li>
          <li><strong>Job Postings:</strong> Number of recent job listings mentioning the skill</li>
        </ul>
      </div>
    </div>
  );
};

export default SkillComparisonRadar; 