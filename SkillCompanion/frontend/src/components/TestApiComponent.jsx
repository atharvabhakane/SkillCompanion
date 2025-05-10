import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TestApiComponent = () => {
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [error, setError] = useState(null);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/users/public/required-skills/Data%20Scientist');
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
      <h2>API Test: Required Skills for Data Scientist</h2>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <p>Error: {error}</p>
          <button onClick={fetchSkills}>Retry</button>
        </div>
      )}
      
      {skills.length > 0 && (
        <div>
          <h3>Skills Found: {skills.length}</h3>
          <ul>
            {skills.map((skill, index) => (
              <li key={index}>
                <strong>{skill.skillName}</strong> ({skill.importance}) - {skill.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {!loading && !error && skills.length === 0 && (
        <p>No skills found. <button onClick={fetchSkills}>Retry</button></p>
      )}
    </div>
  );
};

export default TestApiComponent; 