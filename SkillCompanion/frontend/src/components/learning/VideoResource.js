import React from 'react';
import './VideoResource.css';

const VideoResource = ({ resource }) => {
  // Determine card class based on quality indicator
  const getCardClass = () => {
    if (resource.qualityIndicator === 'Highly Recommended') {
      return 'video-card highly-recommended';
    } else if (resource.qualityIndicator === 'Recommended') {
      return 'video-card recommended';
    }
    return 'video-card';
  };

  return (
    <div className={getCardClass()}>
      {resource.qualityIndicator && (
        <div className="quality-badge">
          {resource.qualityIndicator}
        </div>
      )}
      
      <div className="video-thumbnail">
        <a href={resource.url} target="_blank" rel="noopener noreferrer">
          <img src={resource.thumbnail} alt={resource.title} />
          {resource.formattedDuration && (
            <div className="video-duration">{resource.formattedDuration}</div>
          )}
        </a>
      </div>
      
      <div className="video-info">
        <h3 className="video-title">
          <a href={resource.url} target="_blank" rel="noopener noreferrer">
            {resource.title}
          </a>
        </h3>
        
        <div className="video-channel">
          <span>{resource.author}</span>
        </div>
        
        <div className="video-stats">
          {resource.formattedViews && (
            <span className="video-views">
              <i className="fas fa-eye"></i> {resource.formattedViews} views
            </span>
          )}
          
          {resource.formattedLikes && (
            <span className="video-likes">
              <i className="fas fa-thumbs-up"></i> {resource.formattedLikes}
            </span>
          )}
        </div>
        
        <p className="video-description">
          {resource.description && resource.description.length > 120
            ? `${resource.description.substring(0, 120)}...`
            : resource.description}
        </p>
        
        {resource.type === 'documentation' && (
          <div className="resource-type documentation">
            <i className="fas fa-book"></i> Documentation
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoResource; 