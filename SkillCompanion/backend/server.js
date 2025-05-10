const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const contributionRoutes = require('./routes/contributionRoutes');
const learningResourcesRoutes = require('./routes/learningResourcesRoutes');
const adminRoutes = require('./routes/adminRoutes');
const axios = require('axios');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());
// Configure CORS to allow requests from frontend domains
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Debug environment variables
console.log('Environment variables:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
console.log('GOOGLE_SHEETS_API_KEY:', process.env.GOOGLE_SHEETS_API_KEY ? 'Set' : 'Not set');
console.log('SKILL_SHEET_ID:', process.env.SKILL_SHEET_ID ? 'Set' : 'Not set');
console.log('TOOL_SHEET_ID:', process.env.TOOL_SHEET_ID ? 'Set' : 'Not set');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', dataRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/learning', learningResourcesRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to view all contributions (remove in production)
app.get('/api/debug/contributions', async (req, res) => {
  try {
    const Contribution = require('./models/Contribution');
    const contributions = await Contribution.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      count: contributions.length,
      data: contributions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error fetching contributions',
      error: error.message
    });
  }
});

// Proxy route for Firebase Authentication (to help with CORS issues in development)
app.use('/firebase-auth-proxy', async (req, res) => {
  try {
    const targetUrl = `https://www.googleapis.com/identitytoolkit/v3${req.url}`;
    console.log(`Proxying request to: ${targetUrl}`);
    
    const response = await axios({
      method: req.method,
      url: targetUrl,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error('Firebase auth proxy error:', error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: error.message });
  }
});

// Debug registered routes
console.log('Registered routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(', ').toUpperCase();
        console.log(`${methods} ${middleware.regexp} ${path}`);
      }
    });
  }
});

// Start server
const startServer = (port) => {
  // Ensure port is within valid range (0-65535)
  if (port >= 65536) {
    console.error('No available ports found. Exiting.');
    process.exit(1);
  }

  const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying port ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

startServer(PORT);

// TEMPORARY: Test YouTube API
const testYouTubeAPI = async () => {
  try {
    console.log('\n===== TESTING YOUTUBE API =====');
    const axios = require('axios');
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
    
    if (!YOUTUBE_API_KEY) {
      console.error('YouTube API key not configured in environment variables');
      return;
    }
    
    console.log('YouTube API Key found, making test request...');
    
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: 'javascript tutorial',
        key: YOUTUBE_API_KEY
      }
    });
    
    if (response.status === 200) {
      console.log('YouTube API test successful!');
      console.log(`Response has ${response.data.items ? response.data.items.length : 0} items`);
      if (response.data.items && response.data.items.length > 0) {
        console.log('First result title:', response.data.items[0].snippet.title);
      }
    } else {
      console.error('Unexpected response status:', response.status);
    }
  } catch (error) {
    console.error('YouTube API test error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
};

// Run the YouTube API test
testYouTubeAPI(); 