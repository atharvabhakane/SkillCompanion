import React, { useState, useEffect } from 'react';
import AdminContributions from './AdminContributions';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const AdminDashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminToken');
    
    if (adminToken) {
      // Verify token with backend
      const verifyToken = async () => {
        try {
          const response = await axios.get(`${API_URL}/admin/verify`, {
            headers: {
              Authorization: `Bearer ${adminToken}`
            }
          });
          
          if (response.data.status === 'success') {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('adminToken');
          }
        } catch (error) {
          console.error('Token verification error:', error);
          localStorage.removeItem('adminToken');
        } finally {
          setIsLoading(false);
        }
      };
      
      verifyToken();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      const response = await axios.post(`${API_URL}/admin/login`, credentials);
      
      if (response.data.status === 'success') {
        localStorage.setItem('adminToken', response.data.token);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setLoginError(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-form">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email"
                value={credentials.email}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="admin@gmail.com" 
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                value={credentials.password}
                onChange={handleInputChange}
                className="form-control" 
                placeholder="Enter password" 
                required
              />
            </div>
            {loginError && <div className="login-error">{loginError}</div>}
            <button type="submit" className="admin-login-btn">
              Login
            </button>
          </form>
          <p className="login-note">
            Hint: Use admin@gmail.com with password 'thisisadmin'
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-title">
          <h2>Manage Contributions</h2>
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      <div className="admin-content">
        <AdminContributions />
      </div>
    </div>
  );
};

export default AdminDashboard; 