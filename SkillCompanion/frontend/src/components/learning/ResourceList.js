import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoResource from './VideoResource';
import './ResourceList.css';

const ResourceList = ({ resourceType, identifier }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        let endpoint;
        if (resourceType === 'role') {
          endpoint = `/api/learning/resources/role/${identifier}`;
        } else if (resourceType === 'skill') {
          endpoint = `/api/learning/resources/skill/${identifier}`;
        } else if (resourceType === 'search') {
          endpoint = `/api/learning/resources/search?query=${identifier}`;
        }

        if (endpoint) {
          const response = await axios.get(endpoint);
          if (response.data.success) {
            setResources(response.data.data);
          } else {
            setError('Failed to fetch resources');
          }
        }
      } catch (err) {
        console.error('Error fetching resources:', err);
        setError('An error occurred while fetching resources');
      } finally {
        setLoading(false);
      }
    };

    if (identifier) {
      fetchResources();
    }
  }, [resourceType, identifier]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/learning/resources/search?query=${searchTerm}`);
      if (response.data.success) {
        setResources(response.data.data);
      } else {
        setError('Search failed');
      }
    } catch (err) {
      console.error('Error searching resources:', err);
      setError('An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (resourceType === 'role') {
      return `Learning Resources for ${identifier} Role`;
    } else if (resourceType === 'skill') {
      return `Learning Resources for ${identifier}`;
    } else if (resourceType === 'search') {
      return `Search Results for "${identifier}"`;
    }
    return 'Learning Resources';
  };

  // Filter resources based on source
  const filteredResources = filter === 'all'
    ? resources
    : resources.filter(resource => resource.source?.toLowerCase() === filter);

  return (
    <div className="resource-list-container">
      <h2 className="resource-list-title">{getTitle()}</h2>
      
      <div className="resource-search-form">
        <form onSubmit={handleSearch}>
          <div className="search-input-container">
            <input
              type="text"
              placeholder="Search for tutorials, courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">Search</button>
          </div>
        </form>
      </div>

      <div className="resources-filter">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Resources
        </button>
        <button 
          className={`filter-btn ${filter === 'youtube' ? 'active' : ''}`}
          onClick={() => setFilter('youtube')}
        >
          Videos
        </button>
        <button 
          className={`filter-btn ${filter === 'coursera' ? 'active' : ''}`}
          onClick={() => setFilter('coursera')}
        >
          Courses
        </button>
        <button 
          className={`filter-btn ${filter === 'documentation' ? 'active' : ''}`}
          onClick={() => setFilter('documentation')}
        >
          Documentations
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Finding the best learning resources...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="no-resources">
          <p>{filter === 'all' ? 'No learning resources found. Try a different search term.' : `No ${filter} resources found. Try another resource type.`}</p>
        </div>
      ) : (
        <div className="resources-grid">
          {filteredResources.map((resource, index) => (
            <VideoResource key={index} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList; 