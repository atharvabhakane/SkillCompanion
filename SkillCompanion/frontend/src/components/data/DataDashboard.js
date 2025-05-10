import React from 'react';
import TrendingAnalysis from '../trends/TrendingAnalysis';
import './DataDashboard.css';

const DataDashboard = () => {
  return (
    <div className="data-dashboard">
      <header className="dashboard-header">
        <h1>Data Dashboard</h1>
        <p>Analyze trending skills, tools, and industry insights</p>
      </header>
      
      <div className="dashboard-content">
        <TrendingAnalysis />
      </div>
      
      <footer className="dashboard-footer">
        <p>Data is refreshed daily from our skills and tools database</p>
      </footer>
    </div>
  );
};

export default DataDashboard; 