import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CloudEngineerTest = () => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/users/public/required-skills/Cloud%20Engineer');
      if (response.data.status === 'success') {
        console.log('API Response:', response.data);
        setSkills(response.data.data.skills || []);
      } else {
        setError('API returned an unsuccessful status');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message || 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch skills when component mounts
    fetchSkills();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Cloud Engineer Skills Test</h2>
      <p>This page specifically tests the Cloud Engineer skills endpoint.</p>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <p>Error: {error}</p>
          <button onClick={fetchSkills}>Retry</button>
        </div>
      )}
      
      {skills.length > 0 && (
        <div>
          <h3>Cloud Engineer Skills Found: {skills.length}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {skills.map((skill, index) => (
              <div key={index} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '15px',
                backgroundColor: skill.importance === 'Essential' ? '#f8f9ff' : 
                                 skill.importance === 'Important' ? '#f9fff8' : '#fffdf8'
              }}>
                <h4 style={{ marginTop: 0 }}>{skill.skillName}</h4>
                <p style={{ 
                  display: 'inline-block',
                  backgroundColor: skill.importance === 'Essential' ? '#e0e7ff' : 
                                   skill.importance === 'Important' ? '#e0ffe7' : '#fff6e0',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '10px'
                }}>{skill.importance}</p>
                <p>{skill.description}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Learning time: {skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!loading && !error && skills.length === 0 && (
        <p>No skills found. <button onClick={fetchSkills}>Retry</button></p>
      )}
    </div>
  );
};

export default CloudEngineerTest; 