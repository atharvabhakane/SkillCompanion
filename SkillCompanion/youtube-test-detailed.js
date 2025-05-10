require('dotenv').config();
const axios = require('axios');

// Get API key and log partial key for verification
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
console.log(`API key ${YOUTUBE_API_KEY ? 'found' : 'not found'} (first 5 chars: ${YOUTUBE_API_KEY.substring(0, 5)}...)`);

async function testYouTubeAPI() {
  try {
    // First try a simple API call that uses minimal quota - checking API status
    console.log('\n1. Testing simple YouTube API call - getting API resources...');
    const resourcesResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
      params: {
        part: 'snippet',
        mine: false,
        maxResults: 1,
        key: YOUTUBE_API_KEY
      }
    });
    
    console.log('Simple API call response status:', resourcesResponse.status);
    
    // Now try the actual search request
    console.log('\n2. Testing YouTube search API...');
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        maxResults: 1,
        q: 'test video',
        type: 'video',
        key: YOUTUBE_API_KEY
      }
    });
    
    console.log('Search API response status:', response.status);
    
    if (response.data && response.data.items && response.data.items.length > 0) {
      console.log('✅ YouTube API is working correctly!');
      console.log('First result:', response.data.items[0].snippet.title);
    } else {
      console.error('⚠️ YouTube API returned an empty result set');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ YouTube API request failed');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error data:', JSON.stringify(error.response.data, null, 2));
      
      // Check for specific error codes
      const errorCode = error.response.data?.error?.errors?.[0]?.reason;
      const errorMessage = error.response.data?.error?.message;
      
      if (errorCode) {
        console.error('\nError code:', errorCode);
        
        // Provide specific advice based on common error codes
        switch(errorCode) {
          case 'dailyLimitExceeded':
          case 'quotaExceeded':
            console.error('DIAGNOSIS: API quota has been exceeded for today.');
            console.error('SOLUTION: Wait until tomorrow or increase your quota in Google Cloud Console.');
            break;
          case 'keyInvalid':
            console.error('DIAGNOSIS: The API key is invalid or malformed.');
            console.error('SOLUTION: Check your API key in the .env file and Google Cloud Console.');
            break;
          case 'accessNotConfigured':
            console.error('DIAGNOSIS: YouTube Data API is not enabled for this project.');
            console.error('SOLUTION: Enable the YouTube Data API v3 in the Google Cloud Console.');
            break;
          case 'ipRefererBlocked':
            console.error('DIAGNOSIS: API key has IP or referrer restrictions that are blocking access.');
            console.error('SOLUTION: Check API key restrictions in Google Cloud Console.');
            break;
          default:
            console.error('DIAGNOSIS: Unknown error. See full error message for details.');
            console.error('SOLUTION: Check the YouTube API documentation for error code:', errorCode);
        }
      }
      
      if (errorMessage) {
        console.error('\nDetailed error message:', errorMessage);
      }
    } else if (error.request) {
      console.error('No response received from API server. This may indicate network issues.');
    } else {
      console.error('Error during request setup:', error.message);
    }
  }
}

testYouTubeAPI().catch(err => console.error('Unhandled error:', err)); 