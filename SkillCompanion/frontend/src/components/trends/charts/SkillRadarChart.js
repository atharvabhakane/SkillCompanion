import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

const SkillRadarChart = ({ data, filters }) => {
  // If no data is provided, show a message
  if (!data || !data.skills || data.skills.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skill gap data available for this role.</p>
      </div>
    );
  }
  
  // Filter skills based on criteria - simplified for dashboard
  const filteredSkills = data.skills.slice(0, 8); // Limit to top 8 skills for readability
  
  // If no skills match the filters, show a message
  if (filteredSkills.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skills match the selected filters for this role.</p>
      </div>
    );
  }
  
  // Prepare data for radar chart
  const chartData = filteredSkills.map(skill => ({
    skillName: skill.skillName.length > 12 ? 
      skill.skillName.substring(0, 12) + '...' : skill.skillName, // Truncate long names
    requiredProficiency: skill.requiredProficiency,
    userProficiency: skill.averageUserProficiency,
    gapScore: skill.gapScore,
    fullSkillName: skill.skillName // Store full name for tooltip
  }));
  
  // Custom tooltip to display more details
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.fullSkillName || data.skillName}</p>
          <p>Required proficiency: <strong>{data.requiredProficiency}/10</strong></p>
          <p>Current proficiency: <strong>{data.userProficiency}/10</strong></p>
          <p>Gap: <strong>{data.gapScore}</strong></p>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="radar-chart-container">
      <h3>Skill Gap Analysis: {data.roleName}</h3>
      
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart outerRadius="70%" data={chartData}>
          <PolarGrid gridType="circle" />
          <PolarAngleAxis dataKey="skillName" tick={{ fill: '#333', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} />
          
          <Radar
            name="Required Proficiency"
            dataKey="requiredProficiency"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          
          <Radar
            name="Current Proficiency"
            dataKey="userProficiency"
            stroke="#82ca9d"
            fill="#82ca9d"
            fillOpacity={0.2}
            strokeWidth={2}
          />
          
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} />
        </RadarChart>
      </ResponsiveContainer>
      
      <div className="chart-analysis">
        <h4>Top Skill Gaps:</h4>
        <ul className="gap-analysis-list">
          {filteredSkills
            .sort((a, b) => b.gapScore - a.gapScore)
            .slice(0, 5) // Show only top 5 gaps for dashboard view
            .map((skill, index) => (
              <li key={index} className="gap-item">
                <span className="skill-name">{skill.skillName}</span>
                <span className="gap-score">
                  Gap: <strong>{skill.gapScore}</strong>
                </span>
                <div 
                  className="gap-bar" 
                  style={{ 
                    width: `${skill.gapScore * 10}%`,
                    backgroundColor: skill.gapScore > 2 ? '#ff6b6b' : '#63c132'
                  }}
                />
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default SkillRadarChart; 