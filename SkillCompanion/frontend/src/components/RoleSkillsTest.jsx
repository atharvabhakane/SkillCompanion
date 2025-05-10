import React, { useState } from 'react';
import axios from 'axios';

const RoleSkillsTest = () => {
  const [role, setRole] = useState('Cloud Engineer');
  const [skill, setSkill] = useState('AWS');
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resourcesError, setResourcesError] = useState(null);

  // Example role suggestions
  const roleSuggestions = [
    'Cloud Engineer', 
    'Data Scientist', 
    'Frontend Developer', 
    'Backend Developer',
    'DevOps Engineer',
    'Product Manager',
    'UX Designer',
    'Machine Learning Engineer',
    'Blockchain Developer',
    'Mobile Developer'
  ];

  // Fetch skills for a role
  const fetchSkills = async (e) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setError(null);
    setSkills([]);

    try {
      const response = await axios.get(`/api/users/public/required-skills/${encodeURIComponent(role)}`);
      
      if (response.data.status === 'success') {
        setSkills(response.data.data.skills || []);
        // Set a skill for resources testing if we get skills back
        if (response.data.data.skills && response.data.data.skills.length > 0) {
          setSkill(response.data.data.skills[0].skillName);
        }
      } else {
        setError('Failed to get skills - unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching skills:', err);
      setError(err.message || 'Failed to fetch skills');
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources for a skill
  const fetchResources = async (e) => {
    e.preventDefault();
    if (!skill) return;

    setResourcesLoading(true);
    setResourcesError(null);
    setResources([]);

    try {
      const response = await axios.get(`/api/learning/skill/${encodeURIComponent(skill)}`);
      
      if (response.data.success) {
        setResources(response.data.data || []);
      } else {
        setResourcesError('Failed to get resources - unsuccessful response');
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
      if (err.response && err.response.status === 404) {
        // Handle case when no resources are found
        setResourcesError(`No learning resources found for "${skill}"`);
      } else {
        setResourcesError(err.message || 'Failed to fetch resources');
      }
    } finally {
      setResourcesLoading(false);
    }
  };

  // Use a skill from the skills list
  const selectSkill = (skillName) => {
    setSkill(skillName);
  };

  // CSS styles
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      borderBottom: '1px solid #eee',
      paddingBottom: '10px',
      marginBottom: '20px'
    },
    section: {
      marginBottom: '30px',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px'
    },
    formGroup: {
      marginBottom: '15px'
    },
    inputGroup: {
      display: 'flex',
      gap: '10px'
    },
    input: {
      padding: '8px 12px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      flexGrow: 1,
      fontSize: '16px'
    },
    button: {
      padding: '8px 16px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '16px'
    },
    suggestionButton: {
      padding: '6px 12px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ddd',
      borderRadius: '4px',
      margin: '5px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '20px',
      marginTop: '20px'
    },
    card: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '15px',
      backgroundColor: 'white'
    },
    cardTitle: {
      margin: '0 0 10px 0',
      fontSize: '18px',
      fontWeight: 'bold'
    },
    badge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      marginBottom: '10px'
    },
    essential: {
      backgroundColor: '#e0e7ff',
      color: '#4338ca'
    },
    important: {
      backgroundColor: '#e0ffe7',
      color: '#166534'
    },
    helpful: {
      backgroundColor: '#fff6e0',
      color: '#854d0e'
    },
    resourceCard: {
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'white',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      ':hover': {
        transform: 'translateY(-5px)'
      }
    },
    thumbnail: {
      width: '100%',
      height: '160px',
      objectFit: 'cover'
    },
    resourceContent: {
      padding: '15px'
    },
    sourceBadge: {
      display: 'inline-block',
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      backgroundColor: '#f0f0f0',
      marginRight: '5px'
    },
    loading: {
      textAlign: 'center',
      padding: '20px'
    },
    suggestions: {
      display: 'flex',
      flexWrap: 'wrap',
      marginTop: '10px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2>Role Skills & Learning Resources Tester</h2>
        <p>Test skills for any role and find learning resources for any skill</p>
      </div>

      {/* Skills by Role Section */}
      <div style={styles.section}>
        <h3>Find Skills by Role</h3>
        <form onSubmit={fetchSkills}>
          <div style={styles.formGroup}>
            <label htmlFor="role">Enter a role/job title:</label>
            <div style={styles.inputGroup}>
              <input
                id="role"
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g., Data Scientist"
                style={styles.input}
              />
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Loading...' : 'Get Skills'}
              </button>
            </div>
          </div>
        </form>

        <div style={styles.suggestions}>
          <strong>Try:</strong>
          {roleSuggestions.map((suggestion) => (
            <button 
              key={suggestion} 
              onClick={() => setRole(suggestion)} 
              style={styles.suggestionButton}
            >
              {suggestion}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ color: 'red', margin: '15px 0' }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={styles.loading}>
            <p>Loading skills...</p>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <h3>Skills for {role}</h3>
            <div style={styles.grid}>
              {skills.map((skill, index) => (
                <div key={index} style={styles.card}>
                  <h4 style={styles.cardTitle}>{skill.skillName}</h4>
                  <div 
                    style={{
                      ...styles.badge,
                      ...(skill.importance === 'Essential' ? styles.essential :
                         skill.importance === 'Important' ? styles.important : 
                         styles.helpful)
                    }}
                  >
                    {skill.importance}
                  </div>
                  <p>{skill.description}</p>
                  <p style={{ color: '#666', fontSize: '14px' }}>
                    Learning time: {skill.learningTimeMonths} {skill.learningTimeMonths === 1 ? 'month' : 'months'}
                  </p>
                  <button 
                    onClick={() => selectSkill(skill.skillName)} 
                    style={{ ...styles.button, backgroundColor: '#22543d' }}
                  >
                    Find Resources
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Resources by Skill Section */}
      <div style={styles.section}>
        <h3>Find Learning Resources by Skill</h3>
        <form onSubmit={fetchResources}>
          <div style={styles.formGroup}>
            <label htmlFor="skill">Enter a skill/technology:</label>
            <div style={styles.inputGroup}>
              <input
                id="skill"
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g., Python"
                style={styles.input}
              />
              <button type="submit" style={styles.button} disabled={resourcesLoading}>
                {resourcesLoading ? 'Loading...' : 'Get Resources'}
              </button>
            </div>
          </div>
        </form>

        {resourcesError && (
          <div style={{ color: 'red', margin: '15px 0' }}>
            {resourcesError}
          </div>
        )}

        {resourcesLoading && (
          <div style={styles.loading}>
            <p>Loading resources...</p>
          </div>
        )}

        {resources.length > 0 && (
          <div>
            <h3>Learning Resources for {skill}</h3>
            <div style={styles.grid}>
              {resources.map((resource, index) => (
                <div 
                  key={index} 
                  style={styles.resourceCard}
                  onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                >
                  {resource.thumbnail && (
                    <img 
                      src={resource.thumbnail} 
                      alt={resource.title} 
                      style={styles.thumbnail}
                    />
                  )}
                  <div style={styles.resourceContent}>
                    <h4 style={styles.cardTitle}>{resource.title}</h4>
                    {resource.author && (
                      <p style={{ color: '#666', fontSize: '14px' }}>
                        by {resource.author}
                      </p>
                    )}
                    {resource.description && (
                      <p style={{ fontSize: '14px' }}>
                        {resource.description.length > 120 
                          ? `${resource.description.substring(0, 120)}...` 
                          : resource.description
                        }
                      </p>
                    )}
                    <div>
                      {resource.source && (
                        <span style={styles.sourceBadge}>
                          {resource.source}
                        </span>
                      )}
                      {resource.type && (
                        <span style={styles.sourceBadge}>
                          {resource.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleSkillsTest; 