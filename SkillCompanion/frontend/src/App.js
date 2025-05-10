import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import SkillGapAnalysis from './components/skills/SkillGapAnalysis';
import DataDashboard from './components/data/DataDashboard';
import ContributionPage from './components/contributions/ContributionPage';
import AdminContributions from './components/admin/AdminContributions';
import AdminDashboard from './components/admin/AdminDashboard';
import UserProfile from './pages/UserProfile';
import TestApiComponent from './components/TestApiComponent';
import CloudEngineerTest from './components/CloudEngineerTest';
import RoleSkillsTest from './components/RoleSkillsTest';
import './App.css';

// NavLink component to handle active state
const NavLink = ({ to, children, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link to={to} className={`nav-link ${isActive ? 'active' : ''}`}>
      {icon && <span className="icon">{icon}</span>}
      {children}
    </Link>
  );
};

// Basic placeholder components
const Home = () => (
  <div className="home-container container">
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">Level Up Your Tech Career</h1>
        <p className="hero-description">
          Discover in-demand skills, track industry trends, and connect with opportunities 
          that match your expertise. Your tech career journey starts here.
        </p>
        <div className="hero-buttons">
          <Link to="/skill-gap-analysis" className="hero-cta">Analyze Your Skills</Link>
          <Link to="/admin" className="hero-admin-link">Admin Login</Link>
        </div>
      </div>
      <div className="hero-image">
        <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80" 
          alt="Person working on a laptop with code on screen" />
      </div>
    </div>
    
    <div className="features-section">
      <div className="section-header">
        <h2>Why Choose SkillHub?</h2>
        <p className="subtitle">Gain the competitive edge in the tech industry</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3>Skill Analysis</h3>
          <p>Identify gaps in your skillset and discover what you need to learn next.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Market Trends</h3>
          <p>Stay updated with the latest tech industry trends and in-demand skills.</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3>Community</h3>
          <p>Contribute to our growing database and help others level up their careers.</p>
        </div>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="about-container container">
    <div className="page-header">
      <h1>About SkillHub</h1>
      <p className="subtitle">Empowering tech professionals through data-driven insights</p>
    </div>
    
    <div className="content-section">
      <div className="about-card">
        <h2>Our Mission</h2>
        <p>
          SkillHub aims to bridge the gap between education and industry by providing 
          real-time insights into the most in-demand skills and tools in the tech industry.
          We believe that everyone should have access to the information they need to make
          informed decisions about their career paths.
        </p>
      </div>
      
      <div className="about-card">
        <h2>How It Works</h2>
        <p>
          Our platform analyzes data from multiple sources to identify trends in the tech industry.
          We use this data to help you understand which skills are most valuable, where there might
          be gaps in your knowledge, and what you should learn next to advance your career.
        </p>
      </div>
      
      <div className="about-card">
        <h2>Community-Driven</h2>
        <p>
          SkillHub is built on the contributions of our community. By sharing your knowledge
          and experiences, you help make the platform more accurate and useful for everyone.
          Join us in creating a more transparent and accessible tech industry.
        </p>
      </div>
    </div>
  </div>
);

const Dashboard = () => (
  <div className="dashboard-container container">
    <div className="page-header">
      <h1>Your Dashboard</h1>
      <p className="subtitle">Track your progress and explore personalized recommendations</p>
    </div>
    
    <div className="dashboard-grid">
      <div className="dashboard-card">
        <h3>Your Profile</h3>
        <p>View and edit your personal information and skills.</p>
        <Link to="/profile" className="btn-primary">Manage Profile</Link>
      </div>
    
      <div className="dashboard-card">
        <h3>Skill Progress</h3>
        <p>View and track your skill development over time.</p>
        <Link to="/skill-gap-analysis" className="btn-primary">Analyze Skills</Link>
      </div>
      
      <div className="dashboard-card">
        <h3>Learning Path</h3>
        <p>Follow your personalized learning path to reach your career goals.</p>
        <button className="btn-secondary">View Path</button>
      </div>
      
      <div className="dashboard-card">
        <h3>Industry Trends</h3>
        <p>Stay updated with the latest trends in your field.</p>
        <Link to="/data-dashboard" className="btn-accent">Explore Trends</Link>
      </div>
      
      <div className="dashboard-card">
        <h3>Your Contributions</h3>
        <p>Manage the skills and tools you've contributed to our database.</p>
        <Link to="/contribute" className="btn-outline">Contribute</Link>
      </div>
    </div>
  </div>
);

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Header component
const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <header className="main-header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <span className="logo-text">SkillHub</span>
            <span className="logo-dot">.</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <ul className="nav-links">
            <li><NavLink to="/" icon="🏠">Home</NavLink></li>
            <li><NavLink to="/about" icon="ℹ️">About</NavLink></li>
            {currentUser ? (
              <>
                <li><NavLink to="/dashboard" icon="📊">Dashboard</NavLink></li>
                <li><NavLink to="/profile" icon="👤">My Profile</NavLink></li>
                <li><NavLink to="/skill-gap-analysis" icon="📈">Skills Analysis</NavLink></li>
                <li><NavLink to="/data-dashboard" icon="📱">Trending Tech</NavLink></li>
                <li><NavLink to="/contribute" icon="🤝">Contribute</NavLink></li>
              </>
            ) : (
              <li><NavLink to="/contribute" icon="🤝">Contribute</NavLink></li>
            )}
          </ul>
        </nav>
        
        <div className="auth-actions">
          {currentUser ? (
            <div className="user-menu">
              <span className="user-greeting">Hey, {currentUser.username || 'User'}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
              {currentUser.email && currentUser.email.includes('admin') && (
                <Link to="/admin/contributions" className="admin-link">
                  <span className="admin-badge">Admin Panel</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="login-btn">Log In</Link>
              <Link to="/register" className="register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Main App component
function AppContent() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  // Test backend connection
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        if (data.status === 'OK') {
          setBackendStatus('Connected');
        } else {
          setBackendStatus('Error');
        }
      } catch (error) {
        setBackendStatus('Error');
        console.error('Backend connection error:', error);
      }
    };

    checkBackend();
    
    // Check connection periodically
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusClass = () => {
    if (backendStatus === 'Connected') return 'connected';
    if (backendStatus === 'Error') return 'error';
    return 'checking';
  };

  return (
    <Router>
      <Header />
      <main className="app-main">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/api-test" element={<TestApiComponent />} />
            <Route path="/cloud-engineer-test" element={<CloudEngineerTest />} />
            <Route path="/role-skills-test" element={<RoleSkillsTest />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/skill-gap-analysis" element={
              <ProtectedRoute>
                <SkillGapAnalysis />
              </ProtectedRoute>
            } />
            <Route path="/data-dashboard" element={<DataDashboard />} />
            <Route path="/contribute" element={<ContributionPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/contributions" element={<AdminDashboard />} />
          </Routes>
        </div>
      </main>
      
      <footer className="app-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} SkillHub. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Fixed position backend status indicator */}
      <div className={`backend-status ${getStatusClass()}`}>
        <div className="status-dot"></div>
        Backend: {backendStatus}
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 