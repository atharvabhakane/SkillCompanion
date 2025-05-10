import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SkillGapAnalysis.css'; // Reusing existing CSS

const SkillResources = ({ skillName }) => {
  const { api } = useAuth(); // Use the API instance from AuthContext
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Resource types for filtering
  const resourceTypes = ['all', 'documentation', 'video', 'course', 'tutorial', 'article', 'book'];

  const filteredResources = useMemo(() => {
    // First, ensure all resources have the correct type based on source
    const processedResources = resources.map(resource => {
      let updatedResource = { ...resource };
      
      // Set type based on source if not already set
      if (resource.source === 'YouTube' && !resource.type) {
        updatedResource.type = 'video';
      } else if (resource.source === 'Coursera' && !resource.type) {
        updatedResource.type = 'course';
      }
      
      // If URL contains YouTube, make sure type is video
      if (resource.url && resource.url.includes('youtube.com') && !resource.type) {
        updatedResource.type = 'video';
      }
      
      // If URL contains Coursera, make sure type is course
      if (resource.url && resource.url.includes('coursera.org') && !resource.type) {
        updatedResource.type = 'course';
      }
      
      return updatedResource;
    });
    
    // Then filter based on active filter
    if (activeFilter === 'all') {
      return processedResources;
    } else {
      return processedResources.filter(resource => resource.type === activeFilter);
    }
  }, [resources, activeFilter]);

  useEffect(() => {
    const fetchResources = async () => {
      if (!skillName) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      console.log('Fetching resources for skill:', skillName); // Debug
      
      try {
        // Always use the skill-specific endpoint for direct skill resource matching
        const response = await api.get(`/learning/skill/${encodeURIComponent(skillName)}`);
        
        if (response.data && (response.data.success || response.data.status === 'success')) {
          // Extract resources data from the response
          let resourcesData;
          
          if (response.data.data) {
            resourcesData = response.data.data;
          } else if (response.data.resources) {
            resourcesData = response.data.resources;
          } else {
            const possibleDataFields = ['data', 'resources', 'results', 'items'];
            for (const field of possibleDataFields) {
              if (response.data[field]) {
                resourcesData = response.data[field];
                break;
              }
            }
          }
          
          if (resourcesData && resourcesData.length > 0) {
            console.log(`Found ${resourcesData.length} resources for ${skillName}`);
            
            // Process resources to ensure they have correct types
            const processedResources = resourcesData.map(resource => {
              let updatedResource = { ...resource };
              
              // Set type based on source if not already set
              if (resource.source === 'YouTube' && !resource.type) {
                updatedResource.type = 'video';
              } else if (resource.source === 'Coursera' && !resource.type) {
                updatedResource.type = 'course';
              }
              
              // If URL contains YouTube, make sure type is video
              if (resource.url && resource.url.includes('youtube.com') && !resource.type) {
                updatedResource.type = 'video';
              }
              
              // If URL contains Coursera, make sure type is course
              if (resource.url && resource.url.includes('coursera.org') && !resource.type) {
                updatedResource.type = 'course';
              }
              
              return updatedResource;
            });
            
            setResources(processedResources);
            
            // Set appropriate filter by default
            if (processedResources.some(r => r.type === 'course' || r.source === 'Coursera')) {
              setActiveFilter('course');
            } else if (processedResources.some(r => r.type === 'video' || r.source === 'YouTube')) {
              setActiveFilter('video');
            } else if (processedResources.some(r => r.type === 'documentation')) {
              setActiveFilter('documentation');
            }
            
          } else {
            console.log('No resources found for', skillName);
            // If no resources found, try search endpoint as fallback
            const searchResponse = await api.get(`/learning/search?q=${encodeURIComponent(skillName)}`);
            
            if (searchResponse.data && searchResponse.data.data && searchResponse.data.data.length > 0) {
              setResources(searchResponse.data.data);
              console.log(`Found ${searchResponse.data.data.length} resources via search for ${skillName}`);
            } else {
              setError(`No learning resources found for ${skillName}`);
            }
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setError(`Failed to fetch resources for ${skillName}. ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResources();
  }, [api, skillName]);
  
  // Handle opening a resource in a new tab
  const handleOpenResource = (url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  // Handle changing the active filter
  const handleFilterChange = (type) => {
    setActiveFilter(type);
  };
  
  if (loading) {
    return (
      <div className="resources-loading">
        <div className="loading-spinner"></div>
        <p>Loading resources for {skillName}...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="resources-error">
        <p>{error}</p>
      </div>
    );
  }
  
  if (!resources || resources.length === 0) {
    return (
      <div className="no-resources">
        <p>No learning resources found for {skillName}.</p>
      </div>
    );
  }
  
  return (
    <div className="skill-resources">
      <div className="resource-filters">
        {resourceTypes.filter(type => 
          type === 'all' || resources.some(r => r.type === type)
        ).map(type => (
          <button
            key={type}
            className={`filter-btn ${activeFilter === type ? 'active' : ''}`}
            onClick={() => handleFilterChange(type)}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="resources-grid">
        {filteredResources.map((resource, index) => (
          <div 
            key={index} 
            className={`resource-card ${resource.type || ''}`}
            onClick={() => handleOpenResource(resource.url)}
          >
            {resource.thumbnail && (
              <div className="resource-thumbnail">
                <img src={resource.thumbnail} alt={resource.title} />
                {resource.source === 'YouTube' && (
                  <div className="video-icon">▶</div>
                )}
              </div>
            )}
            <div className="resource-content">
              <h4 className="resource-title">{resource.title}</h4>
              {resource.author && (
                <p className="resource-author">by {resource.author}</p>
              )}
              {resource.description && (
                <p className="resource-description">{resource.description}</p>
              )}
              <div className="resource-meta">
                {resource.source && (
                  <span className={`source-badge ${resource.source.toLowerCase()}`}>
                    {resource.source}
                  </span>
                )}
                {resource.type && resource.type !== 'undefined' && (
                  <span className={`type-badge ${resource.type}`}>
                    {resource.type}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillResources;