require('dotenv').config(); const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''; console.log('API key found:', YOUTUBE_API_KEY ? 'Yes' : 'No', 'Length:', YOUTUBE_API_KEY.length);
