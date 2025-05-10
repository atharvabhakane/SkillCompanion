import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SkillTimelineChart = ({ data }) => {
  // Track selected skills - initialize with empty array
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Filter to the top skills by demand score for better visualization
  const topSkills = data && data.length > 0 
    ? data.sort((a, b) => b.demandScore - a.demandScore).slice(0, 5) 
    : [];
  
  // Update selected skills if empty (only first time or when data changes)
  useEffect(() => {
    if (selectedSkills.length === 0 && topSkills.length > 0) {
      setSelectedSkills(topSkills.slice(0, 3).map(skill => skill.skillId));
    }
  }, [topSkills, selectedSkills.length]);
  
  // If no data is provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No timeline data available.</p>
      </div>
    );
  }
  
  // Handle skill selection/deselection
  const toggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      // Prevent deselecting if only one skill is selected
      if (selectedSkills.length > 1) {
        setSelectedSkills(selectedSkills.filter(id => id !== skillId));
      }
    } else {
      // Prevent selecting more than 4 skills for readability
      if (selectedSkills.length < 4) {
        setSelectedSkills([...selectedSkills, skillId]);
      }
    }
  };
  
  // Prepare timeline data for the chart
  const prepareTimelineData = () => {
    const skillsToShow = topSkills.filter(skill => 
      selectedSkills.includes(skill.skillId)
    );
    
    // Get all unique timeline periods
    const allPeriods = new Set();
    skillsToShow.forEach(skill => {
      if (skill.timeline && Array.isArray(skill.timeline)) {
        skill.timeline.forEach(periodData => {
          const period = Object.keys(periodData)[0];
          if (period) {
            allPeriods.add(period);
          }
        });
      }
    });
    
    // Sort periods chronologically
    const sortedPeriods = Array.from(allPeriods).sort();
    
    // Create data points for each period
    const timelineData = sortedPeriods.map(period => {
      const dataPoint = { period };
      
      skillsToShow.forEach(skill => {
        if (skill.timeline && Array.isArray(skill.timeline)) {
          const periodData = skill.timeline.find(pd => Object.keys(pd)[0] === period);
          if (periodData) {
            dataPoint[skill.skillName] = periodData[period];
          } else {
            dataPoint[skill.skillName] = null;
          }
        }
      });
      
      return dataPoint;
    });
    
    return timelineData;
  };
  
  // Generate a unique color for each skill
  const getSkillColor = (index) => {
    const colors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
      '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
    ];
    return colors[index % colors.length];
  };
  
  // Prepare the chart data
  const timelineData = prepareTimelineData();
  
  // Create a custom tooltip that shows all values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="timeline-chart-container">
      <h3>Skill Demand Timeline</h3>
      
      {/* Skill selector */}
      <div className="skill-selector">
        <h4>Select Skills to Compare (max 4):</h4>
        <div className="skill-selector-list">
          {topSkills.map((skill, index) => (
            <button
              key={skill.skillId}
              className={`skill-selector-button ${selectedSkills.includes(skill.skillId) ? 'selected' : ''}`}
              onClick={() => toggleSkill(skill.skillId)}
              style={{
                borderColor: selectedSkills.includes(skill.skillId) ? getSkillColor(index) : 'transparent',
                color: selectedSkills.includes(skill.skillId) ? getSkillColor(index) : 'inherit'
              }}
            >
              {skill.skillName}
            </button>
          ))}
        </div>
      </div>
      
      {/* Timeline Chart */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={timelineData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {topSkills
            .filter(skill => selectedSkills.includes(skill.skillId))
            .map((skill, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={skill.skillName}
                stroke={getSkillColor(index)}
                activeDot={{ r: 8 }}
                connectNulls
                strokeWidth={2}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
      
      {/* Trend analysis */}
      <div className="trend-analysis">
        <h4>Projected Growth:</h4>
        <div className="trend-analysis-list">
          {topSkills
            .filter(skill => selectedSkills.includes(skill.skillId))
            .map((skill, index) => {
              // Calculate growth rate
              let growthRate = 0;
              if (skill.timeline && skill.timeline.length >= 2) {
                const firstPeriod = skill.timeline[0];
                const lastPeriod = skill.timeline[skill.timeline.length - 1];
                const firstValue = Object.values(firstPeriod)[0];
                const lastValue = Object.values(lastPeriod)[0];
                
                if (firstValue > 0) {
                  growthRate = Math.round(((lastValue - firstValue) / firstValue) * 100);
                }
              }
              
              return (
                <div key={index} className="trend-item">
                  <div className="trend-skill-name" style={{ color: getSkillColor(index) }}>
                    {skill.skillName}
                  </div>
                  <div className="trend-growth">
                    <strong>{growthRate}%</strong> projected growth
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SkillTimelineChart; 