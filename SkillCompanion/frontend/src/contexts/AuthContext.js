import React, { createContext, useState, useEffect, useContext } from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';
import axios from 'axios';

// Firebase configuration - using direct values from .env file
const firebaseConfig = {
  apiKey: "AIzaSyDK5bWVwwJQECwclFW_5udpP1RTWpoZSR8",
  authDomain: "my-skill-project-425.firebaseapp.com",
  projectId: "my-skill-project-425",
  storageBucket: "my-skill-project-425.firebasestorage.app",
  messagingSenderId: "684740813985",
  appId: "684740813985"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  
  // Only for development - override Firebase authentication API endpoint to use our proxy
  if (window.location.hostname === 'localhost') {
    firebase.auth().useDeviceLanguage();
    
    // This is a workaround for CORS issues during development
    const auth = firebase.auth();
    auth.tenantId = null;
    
    // Override Firebase's internal API endpoints to go through our proxy
    // This is just for local development to bypass CORS issues
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      if (url.includes('www.googleapis.com/identitytoolkit')) {
        // Extract the path after identitytoolkit/v3
        const path = url.split('identitytoolkit/v3')[1];
        // Use our proxy instead
        return originalFetch(`/firebase-auth-proxy${path}`, options);
      }
      return originalFetch(url, options);
    };
  }
}

export const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up API client
  const api = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true
  });

  // Add request interceptor for debugging
  api.interceptors.request.use(config => {
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  }, error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  });

  // Add response interceptor for debugging
  api.interceptors.response.use(response => {
    console.log(`API Response: ${response.status} - ${response.config.method.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  }, error => {
    if (error.response) {
      console.error(`API Response Error: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('API No Response Received:', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  });

  // Add token to requests
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token, api.defaults.headers.common]);

  // Register with email/password
  const register = async (email, password, username) => {
    try {
      setError(null);
      const response = await api.post('/auth/register', {
        email,
        password,
        username
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        setCurrentUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Login with email/password
  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        setCurrentUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    try {
      setError(null);
      const provider = new firebase.auth.GoogleAuthProvider();
      // Force account selection even if user is already signed in
      provider.setCustomParameters({ prompt: 'select_account' });
      
      // Sign in with Firebase
      const result = await firebase.auth().signInWithPopup(provider);
      
      // Get the user from the result
      const { user } = result;
      const email = user.email;
      const username = user.displayName || email.split('@')[0];
      
      // We don't need to send the idToken to our backend anymore
      // const idToken = await user.getIdToken();
      
      // Create our own JWT token via the server (don't send the Google token)
      const response = await api.post('/auth/google-login', {
        email: email,
        username: username,
        firebaseUid: user.uid
      });
      
      if (response.data.token) {
        setToken(response.data.token);
        setCurrentUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        return response.data;
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError('Google login failed: ' + (error.message || ''));
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await firebase.auth().signOut();
      setCurrentUser(null);
      setToken(null);
      localStorage.removeItem('token');
    } catch (error) {
      setError('Logout failed');
      throw error;
    }
  };

  // Check token and set user on mount
  useEffect(() => {
    const checkToken = async () => {
      try {
        const savedToken = localStorage.getItem('token');
        if (savedToken) {
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // Validate token by getting user profile
          const response = await api.get('/users/profile');
          
          if (response.data.status === 'success') {
            setToken(savedToken);
            setCurrentUser(response.data.data.user);
          } else {
            // Token is invalid
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        // Token is invalid
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    checkToken();
  }, [api]);

  const value = {
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    api
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 