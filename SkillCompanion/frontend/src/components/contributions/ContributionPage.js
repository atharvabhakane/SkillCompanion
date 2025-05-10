import React, { useState } from 'react';
import SkillContributionForm from './SkillContributionForm';
import ToolContributionForm from './ToolContributionForm';
import './ContributionPage.css';

const ContributionPage = () => {
  const [activeTab, setActiveTab] = useState('skill');

  return (
    <div className="contribution-page">
      <div className="container">
        <div className="page-header">
          <h1>Community Contributions</h1>
          <p>Help grow our database of skills and tools by contributing your knowledge. Your submissions will be reviewed by our team before being added to the database.</p>
        </div>

        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'skill' ? 'active' : ''}`}
            onClick={() => setActiveTab('skill')}
          >
            Contribute a Skill
          </button>
          <button
            className={`tab-btn ${activeTab === 'tool' ? 'active' : ''}`}
            onClick={() => setActiveTab('tool')}
          >
            Contribute a Tool
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'skill' ? (
            <SkillContributionForm />
          ) : (
            <ToolContributionForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionPage; 