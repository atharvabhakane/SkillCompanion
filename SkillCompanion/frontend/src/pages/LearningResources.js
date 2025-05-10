import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ResourceList from '../components/learning/ResourceList';
import './LearningResources.css';

const LearningResources = () => {
  const { type, id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryTerm = queryParams.get('query');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(type || 'search');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // We'll handle the query here rather than navigating
      setActiveTab('search');
    }
  };

  // Determine what resource type and identifier to use based on routing or local state
  const getResourceProps = () => {
    if (activeTab === 'role' && id) {
      return { resourceType: 'role', identifier: id };
    } else if (activeTab === 'skill' && id) {
      return { resourceType: 'skill', identifier: id };
    } else if (activeTab === 'search') {
      // If we have a query from URL params, use that, otherwise use local state
      return { resourceType: 'search', identifier: queryTerm || searchQuery };
    }
    // Default to showing a search prompt
    return { resourceType: null, identifier: null };
  };

  const resourceProps = getResourceProps();

  return (
    <div className="learning-resources-page">
      <div className="page-header">
        <h1>Learning Resources</h1>
        <p>Find the best tutorials, courses, and resources to enhance your skills</p>
      </div>
      
      <div className="search-container">
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search for resources on any technology, tool, or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="main-search-input"
          />
          <button type="submit" className="main-search-button">Find Resources</button>
        </form>
      </div>
      
      {!resourceProps.identifier ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h2>Start Your Learning Journey</h2>
            <p>Search for any technology, framework, or programming language above to find learning resources.</p>
            <div className="suggestion-chips">
              <button onClick={() => { setSearchQuery('React'); setActiveTab('search'); }}>React</button>
              <button onClick={() => { setSearchQuery('JavaScript'); setActiveTab('search'); }}>JavaScript</button>
              <button onClick={() => { setSearchQuery('Python'); setActiveTab('search'); }}>Python</button>
              <button onClick={() => { setSearchQuery('Machine Learning'); setActiveTab('search'); }}>Machine Learning</button>
              <button onClick={() => { setSearchQuery('DevOps'); setActiveTab('search'); }}>DevOps</button>
            </div>
          </div>
        </div>
      ) : (
        <ResourceList 
          resourceType={resourceProps.resourceType} 
          identifier={resourceProps.identifier} 
        />
      )}
    </div>
  );
};

export default LearningResources; 