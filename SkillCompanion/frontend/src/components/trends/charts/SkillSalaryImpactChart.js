import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const SkillSalaryImpactChart = ({ data, skillsData, filters }) => {
  // If no data is provided, show a message
  if (!data || data.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No salary impact data available for skills.</p>
      </div>
    );
  }
  
  // Process and filter data
  const processData = () => {
    // Start with the impact data
    let processedData = [...data];
    
    // Filter by category if specified
    if (filters && filters.category !== 'All') {
      processedData = processedData.filter(skill => {
        const skillDetails = skillsData.find(s => s.skillId === skill.skillId);
        return skillDetails && skillDetails.category === filters.category;
      });
    }
    
    // Map impact levels to numeric values for sorting
    const impactMap = {
      'High': 3,
      'Medium': 2,
      'Low': 1
    };
    
    // Enhance data with salary information if available
    return processedData.map(skill => {
      const skillDetails = skillsData.find(s => s.skillId === skill.skillId);
      
      return {
        ...skill,
        salary: skillDetails ? 
          parseInt(skillDetails.averageSalary.replace(/[^0-9]/g, '')) || 0 : 0,
        growth: skillDetails ? 
          parseFloat(skillDetails.growthRate.replace('%', '')) || 0 : 0,
        impactValue: impactMap[skill.impactOnSalary] || 0
      };
    })
    .sort((a, b) => b.impactValue - a.impactValue || b.salary - a.salary)
    .slice(0, 15); // Limit to top 15 for readability
  };
  
  // Get processed data
  const processedData = processData();
  
  // If no skills match the filters, show a message
  if (processedData.length === 0) {
    return (
      <div className="chart-placeholder">
        <p>No skills match the selected filters.</p>
      </div>
    );
  }
  
  // Get the average salary
  const averageSalary = skillsData && skillsData.length ? 
    skillsData.reduce((sum, skill) => {
      return sum + (parseInt(skill.averageSalary.replace(/[^0-9]/g, '')) || 0);
    }, 0) / skillsData.length : 0;
  
  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.skillName}</p>
          <p>Average Salary: <strong>${data.salary.toLocaleString()}</strong></p>
          <p>Growth Rate: <strong>{data.growth}%</strong></p>
          <p>Impact on Salary: <strong>{data.impactOnSalary}</strong></p>
          <p>Gap Score: <strong>{data.gapScore}</strong></p>
        </div>
      );
    }
    
    return null;
  };
  
  // Custom label for bars
  const renderCustomBarLabel = ({ x, y, width, value }) => {
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="#666" 
        textAnchor="middle" 
        fontSize={12}
      >
        ${value.toLocaleString()}
      </text>
    );
  };
  
  // Generate color based on impact level
  const getBarColor = (impactLevel) => {
    switch(impactLevel) {
      case 'High':
        return '#ff6b6b';
      case 'Medium':
        return '#ffa06b';
      case 'Low':
        return '#ffd66b';
      default:
        return '#aaaaaa';
    }
  };
  
  return (
    <div className="salary-impact-container">
      <h3>Salary Impact by Skill</h3>
      <div className="chart-info">
        <p>
          This chart shows the estimated salary impact of different skills.
          The colors indicate the impact level (High, Medium, Low) while the 
          bar height shows the average salary associated with each skill.
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={processedData}
          margin={{
            top: 30,
            right: 30,
            left: 20,
            bottom: 120,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="skillName" 
            angle={-45} 
            textAnchor="end" 
            height={80} 
            interval={0}
          />
          <YAxis 
            domain={[0, 'dataMax + 10000']}
            tickFormatter={(value) => `$${(value / 1000)}k`}
            label={{ value: 'Average Salary (USD)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend payload={
            [
              { value: 'High Impact', type: 'square', color: '#ff6b6b' },
              { value: 'Medium Impact', type: 'square', color: '#ffa06b' },
              { value: 'Low Impact', type: 'square', color: '#ffd66b' }
            ]
          } />
          <ReferenceLine 
            y={averageSalary} 
            label={{ 
              value: `Avg: $${Math.round(averageSalary/1000)}k`, 
              position: 'right' 
            }} 
            stroke="#666" 
            strokeDasharray="3 3" 
          />
          <Bar 
            dataKey="salary" 
            name="Average Salary" 
            label={renderCustomBarLabel}
          >
            {processedData.map((entry, index) => (
              <Bar 
                key={`bar-${index}`} 
                fill={getBarColor(entry.impactOnSalary)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="impact-analysis">
        <h4>Salary Impact Analysis:</h4>
        <div className="impact-categories">
          <div className="impact-category high">
            <h5>High Impact Skills</h5>
            <ul>
              {processedData
                .filter(skill => skill.impactOnSalary === 'High')
                .map((skill, index) => (
                  <li key={index}>
                    <strong>{skill.skillName}</strong>: ${skill.salary.toLocaleString()}
                    <span className="growth-rate">Growth: {skill.growth}%</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <div className="impact-category medium">
            <h5>Medium Impact Skills</h5>
            <ul>
              {processedData
                .filter(skill => skill.impactOnSalary === 'Medium')
                .map((skill, index) => (
                  <li key={index}>
                    <strong>{skill.skillName}</strong>: ${skill.salary.toLocaleString()}
                    <span className="growth-rate">Growth: {skill.growth}%</span>
                  </li>
                ))}
            </ul>
          </div>
          
          <div className="impact-category low">
            <h5>Low Impact Skills</h5>
            <ul>
              {processedData
                .filter(skill => skill.impactOnSalary === 'Low')
                .map((skill, index) => (
                  <li key={index}>
                    <strong>{skill.skillName}</strong>: ${skill.salary.toLocaleString()}
                    <span className="growth-rate">Growth: {skill.growth}%</span>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillSalaryImpactChart; 