const axios = require('axios');
require('dotenv').config();
const courseraService = require('./courseraService');

/**
 * YouTube Resources Service
 * Fetches learning resources from YouTube based on skills and target roles
 */

// YouTube API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Mock data for development (in a real app, these would come from a database or API)
const roleBasedCourses = {
  'Frontend Developer': [
    {
      title: 'Complete Front-End Web Development Course',
      url: 'https://www.youtube.com/playlist?list=PL0Zuz27SZ-6Pk-QJIdGd1tGZEzy9RTgtj',
      thumbnail: 'https://i.ytimg.com/vi/QA0XpGhiz5w/hqdefault.jpg',
      author: 'Dave Gray',
      description: 'Learn HTML, CSS, JavaScript, React, and more to become a frontend developer.'
    },
    {
      title: 'React JS Course for Beginners',
      url: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
      thumbnail: 'https://i.ytimg.com/vi/RVFAyFWO4go/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn React from scratch in this comprehensive guide for beginners.'
    },
    {
      title: 'CSS Complete Course',
      url: 'https://www.youtube.com/watch?v=n4R2E7O-Ngo',
      thumbnail: 'https://i.ytimg.com/vi/n4R2E7O-Ngo/hqdefault.jpg',
      author: 'Dave Gray',
      description: 'Master CSS with this complete course - from basics to advanced.'
    }
  ],
  'Backend Developer': [
    {
      title: 'Node.js and Express.js - Full Course',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Node.js and Express from scratch.'
    },
    {
      title: 'MongoDB Complete Course',
      url: 'https://www.youtube.com/watch?v=c2M-rlkkT5o',
      thumbnail: 'https://i.ytimg.com/vi/c2M-rlkkT5o/hqdefault.jpg',
      author: 'Bogdan Stashchuk',
      description: 'Learn MongoDB database from scratch.'
    },
    {
      title: 'API Development with Node.js',
      url: 'https://www.youtube.com/watch?v=rltfdjcXjmk',
      thumbnail: 'https://i.ytimg.com/vi/rltfdjcXjmk/hqdefault.jpg',
      author: 'Academind',
      description: 'Build RESTful APIs with Node.js, Express and MongoDB.'
    }
  ],
  'Full Stack Developer': [
    {
      title: 'MERN Stack Course',
      url: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
      thumbnail: 'https://i.ytimg.com/vi/7CqJlxBYj-M/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn to build a complete app with the MERN stack.'
    },
    {
      title: 'Full Stack Development Tutorial',
      url: 'https://www.youtube.com/watch?v=nu_pCVPKzTk',
      thumbnail: 'https://i.ytimg.com/vi/nu_pCVPKzTk/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Full Stack React & Django Application Tutorial.'
    },
    {
      title: 'JavaScript Full Course',
      url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
      thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn JavaScript from basics to advanced concepts.'
    }
  ],
  'Data Scientist': [
    {
      title: 'Python for Data Science Full Course',
      url: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
      thumbnail: 'https://i.ytimg.com/vi/LHBE6Q9XlzI/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Python for Data Science from scratch.'
    },
    {
      title: 'Data Science Full Course',
      url: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
      thumbnail: 'https://i.ytimg.com/vi/ua-CiDNNj30/hqdefault.jpg',
      author: 'Edureka',
      description: 'Complete data science training from basic to advanced concepts.'
    },
    {
      title: 'Machine Learning Course for Beginners',
      url: 'https://www.youtube.com/watch?v=NWONeJKn6kc',
      thumbnail: 'https://i.ytimg.com/vi/NWONeJKn6kc/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn machine learning fundamentals with Python.'
    }
  ],
  'DevOps Engineer': [
    {
      title: 'DevOps Engineering Course',
      url: 'https://www.youtube.com/watch?v=j5Zsa_eOXeY',
      thumbnail: 'https://i.ytimg.com/vi/j5Zsa_eOXeY/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn DevOps engineering concepts and tools.'
    },
    {
      title: 'Docker and Kubernetes Tutorial',
      url: 'https://www.youtube.com/watch?v=bhBSlnQcq2k',
      thumbnail: 'https://i.ytimg.com/vi/bhBSlnQcq2k/hqdefault.jpg',
      author: 'Amigoscode',
      description: 'Learn Docker and Kubernetes from scratch.'
    },
    {
      title: 'Jenkins CI/CD Pipeline Tutorial',
      url: 'https://www.youtube.com/watch?v=7KCS70sCoK0',
      thumbnail: 'https://i.ytimg.com/vi/7KCS70sCoK0/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Learn how to set up CI/CD pipelines with Jenkins.'
    }
  ]
};

// Skill based courses
const skillBasedCourses = {
  'JavaScript': [
    {
      title: 'JavaScript Full Course for Beginners',
      url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
      thumbnail: 'https://i.ytimg.com/vi/PkZNo7MFNFg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn JavaScript from scratch in this 3-hour comprehensive course.'
    },
    {
      title: 'JavaScript Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      thumbnail: 'https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'JavaScript basics for beginners: learn JavaScript fundamentals in 1 hour.'
    },
    {
      title: 'JavaScript Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Official JavaScript documentation with guides, references, and examples.',
      type: 'documentation'
    }
  ],
  'React': [
    {
      title: 'React JS Course for Beginners',
      url: 'https://www.youtube.com/watch?v=RVFAyFWO4go',
      thumbnail: 'https://i.ytimg.com/vi/RVFAyFWO4go/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn React from scratch in this comprehensive guide for beginners.'
    },
    {
      title: 'React Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
      thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn React fundamentals in this beginner-friendly tutorial.'
    },
    {
      title: 'React Documentation',
      url: 'https://react.dev/',
      thumbnail: 'https://react.dev/images/og-home.png',
      author: 'React Team',
      description: 'Official React documentation with guides, API references, and examples.',
      type: 'documentation'
    }
  ],
  'Python': [
    {
      title: 'Python for Beginners - Full Course',
      url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
      thumbnail: 'https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Python - Full Course for Beginners'
    },
    {
      title: 'Python Tutorial - Python Full Course for Beginners',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      thumbnail: 'https://i.ytimg.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Python tutorial for beginners - Learn Python for machine learning and web development.'
    },
    {
      title: 'Python Documentation',
      url: 'https://docs.python.org/3/',
      thumbnail: 'https://www.python.org/static/opengraph-icon-200x200.png',
      author: 'Python.org',
      description: 'Official Python documentation with tutorials, library references, and language syntax.',
      type: 'documentation'
    }
  ],
  'Node.js': [
    {
      title: 'Node.js and Express.js - Full Course',
      url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
      thumbnail: 'https://i.ytimg.com/vi/Oe421EPjeBE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn Node.js and Express from scratch in this 8-hour course.'
    },
    {
      title: 'Node.js Tutorial for Beginners: Learn Node in 1 Hour',
      url: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
      thumbnail: 'https://i.ytimg.com/vi/TlB_eWDSMt4/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Node.js tutorial for beginners: Learn Node.js in 1 hour and start building your own web applications.'
    },
    {
      title: 'Node.js Documentation',
      url: 'https://nodejs.org/en/docs/',
      thumbnail: 'https://nodejs.org/static/images/logo-hexagon-card.png',
      author: 'Node.js',
      description: 'Official Node.js documentation with API references, guides, and tutorials.',
      type: 'documentation'
    }
  ],
  'AWS': [
    {
      title: 'AWS Certified Cloud Practitioner Training',
      url: 'https://www.youtube.com/watch?v=3hLmDS179YE',
      thumbnail: 'https://i.ytimg.com/vi/3hLmDS179YE/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Complete AWS Cloud Practitioner certification training course.'
    },
    {
      title: 'AWS Basics for Beginners',
      url: 'https://www.youtube.com/watch?v=ulprqHHWlng',
      thumbnail: 'https://i.ytimg.com/vi/ulprqHHWlng/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Learn AWS basics and core services for beginners in this comprehensive guide.'
    },
    {
      title: 'AWS Documentation',
      url: 'https://docs.aws.amazon.com/',
      thumbnail: 'https://a0.awsstatic.com/libra-css/images/site/touch-icon-ipad-144-smile.png',
      author: 'Amazon Web Services',
      description: 'Official AWS documentation with service guides, API references, and best practices.',
      type: 'documentation'
    }
  ],
  'Docker': [
    {
      title: 'Docker Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=pTFZFxd4hOI',
      thumbnail: 'https://i.ytimg.com/vi/pTFZFxd4hOI/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn Docker in 2 hours - Docker tutorial for beginners and intermediate users.'
    },
    {
      title: 'Docker Crash Course for Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=pg19Z8LL06w',
      thumbnail: 'https://i.ytimg.com/vi/pg19Z8LL06w/hqdefault.jpg',
      author: 'TechWorld with Nana',
      description: 'Docker crash course for beginners - learn everything you need to know about Docker.'
    },
    {
      title: 'Docker Documentation',
      url: 'https://docs.docker.com/',
      thumbnail: 'https://www.docker.com/wp-content/uploads/2022/03/vertical-logo-monochromatic.png',
      author: 'Docker',
      description: 'Official Docker documentation with guides, references, and examples.',
      type: 'documentation'
    }
  ],
  'Machine Learning': [
    {
      title: 'Machine Learning for Everybody',
      url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
      thumbnail: 'https://i.ytimg.com/vi/i_LwzRVP7bg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn machine learning concepts in a beginner-friendly way.'
    },
    {
      title: 'Machine Learning with Python',
      url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
      thumbnail: 'https://i.ytimg.com/vi/7eh4d6sabA0/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn machine learning using Python and scikit-learn library.'
    },
    {
      title: 'Machine Learning Documentation',
      url: 'https://scikit-learn.org/stable/user_guide.html',
      thumbnail: 'https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png',
      author: 'Scikit-learn',
      description: 'Scikit-learn machine learning library documentation with guides and tutorials.',
      type: 'documentation'
    }
  ],
  'CSS': [
    {
      title: 'CSS Crash Course For Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
      thumbnail: 'https://i.ytimg.com/vi/yfoY53QXEnI/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn CSS in this complete crash course for beginners.'
    },
    {
      title: 'CSS Tutorial - Zero to Hero (Complete Course)',
      url: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
      thumbnail: 'https://i.ytimg.com/vi/1Rs2ND1ryYc/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Complete CSS course covering basics to advanced concepts like Flexbox and Grid.'
    },
    {
      title: 'CSS Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Comprehensive CSS documentation with tutorials, references, and examples.',
      type: 'documentation'
    }
  ],
  'HTML': [
    {
      title: 'HTML Crash Course For Absolute Beginners',
      url: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
      thumbnail: 'https://i.ytimg.com/vi/UB1O30fR-EE/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn HTML in this complete crash course for beginners.'
    },
    {
      title: 'HTML Full Course - Build a Website Tutorial',
      url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
      thumbnail: 'https://i.ytimg.com/vi/pQN-pnXPaVg/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn HTML5 and build a complete website in this comprehensive course.'
    },
    {
      title: 'HTML Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
      thumbnail: 'https://developer.mozilla.org/mdn-social-share.cd6c4a5a.png',
      author: 'MDN Web Docs',
      description: 'Complete HTML documentation with elements reference, guides, and tutorials.',
      type: 'documentation'
    }
  ],
  'SQL': [
    {
      title: 'SQL Tutorial - Full Database Course for Beginners',
      url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
      thumbnail: 'https://i.ytimg.com/vi/HXV3zeQKqGY/hqdefault.jpg',
      author: 'freeCodeCamp',
      description: 'Learn SQL in this complete database course for beginners.'
    },
    {
      title: 'SQL Crash Course - Beginner to Intermediate',
      url: 'https://www.youtube.com/watch?v=nWeW3sCmD2k',
      thumbnail: 'https://i.ytimg.com/vi/nWeW3sCmD2k/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'SQL crash course covering basic to intermediate concepts for database management.'
    },
    {
      title: 'SQL Documentation',
      url: 'https://www.w3schools.com/sql/',
      thumbnail: 'https://www.w3schools.com/favicon.ico',
      author: 'W3Schools',
      description: 'Comprehensive SQL tutorial and reference with examples and exercises.',
      type: 'documentation'
    }
  ],
  'MongoDB': [
    {
      title: 'MongoDB Crash Course',
      url: 'https://www.youtube.com/watch?v=-56x56UppqQ',
      thumbnail: 'https://i.ytimg.com/vi/-56x56UppqQ/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn MongoDB basics in this comprehensive crash course.'
    },
    {
      title: 'MongoDB Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=ExcRbA7fy_A',
      thumbnail: 'https://i.ytimg.com/vi/ExcRbA7fy_A/hqdefault.jpg',
      author: 'Academind',
      description: 'Complete MongoDB tutorial covering all the fundamentals you need to know.'
    },
    {
      title: 'MongoDB Documentation',
      url: 'https://docs.mongodb.com/',
      thumbnail: 'https://webimages.mongodb.com/_com_assets/cms/kuyj3d95v5vbmm2fs-horizontal_white.svg?auto=format%252Ccompress',
      author: 'MongoDB',
      description: 'Official MongoDB documentation with guides, tutorials, and reference materials.',
      type: 'documentation'
    }
  ],
  'Git': [
    {
      title: 'Git and GitHub Crash Course For Beginners',
      url: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc',
      thumbnail: 'https://i.ytimg.com/vi/SWYqp7iY_Tc/hqdefault.jpg',
      author: 'Traversy Media',
      description: 'Learn Git and GitHub in this essential crash course for beginners.'
    },
    {
      title: 'Git Tutorial for Beginners',
      url: 'https://www.youtube.com/watch?v=8JJ101D3knE',
      thumbnail: 'https://i.ytimg.com/vi/8JJ101D3knE/hqdefault.jpg',
      author: 'Programming with Mosh',
      description: 'Learn Git fundamentals in this comprehensive tutorial for beginners.'
    },
    {
      title: 'Git Documentation',
      url: 'https://git-scm.com/doc',
      thumbnail: 'https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png',
      author: 'Git',
      description: 'Official Git documentation including the reference manual and Pro Git book.',
      type: 'documentation'
    }
  ]
};

/**
 * Fetch videos from YouTube API
 * @param {string} query - The search query
 * @param {boolean} isPrimaryQuery - Whether this is the primary query or a fallback
 * @returns {Promise<Array>} - Array of video results
 */
const fetchFromYouTubeAPI = async (query, isPrimaryQuery = true) => {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key is not configured');
  }
  
  try {
    // First fetch search results
    const response = await axios.get(`${YOUTUBE_API_URL}/search`, {
      params: {
        part: 'snippet',
        maxResults: 15, // Fetch more results to filter for the best ones
        q: query,
        type: 'video',
        videoCategoryId: '27', // Education category
        relevanceLanguage: 'en',
        key: YOUTUBE_API_KEY,
        // Balance between relevance and popularity
        order: isPrimaryQuery ? 'relevance' : 'viewCount'
      }
    });

    // Extract video IDs
    const videoIds = response.data.items.map(item => item.id.videoId);
    
    // Get detailed information about videos including statistics
    const videoDetailsResponse = await axios.get(`${YOUTUBE_API_URL}/videos`, {
      params: {
        part: 'contentDetails,statistics,snippet',
        id: videoIds.join(','),
        key: YOUTUBE_API_KEY
      }
    });

    // Format and enhance results with statistics
    const results = videoDetailsResponse.data.items.map(item => ({
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnail: item.snippet.thumbnails.medium.url,
      author: item.snippet.channelTitle,
      description: item.snippet.description,
      duration: item.contentDetails.duration,
      viewCount: parseInt(item.statistics.viewCount || '0', 10),
      likeCount: parseInt(item.statistics.likeCount || '0', 10),
      commentCount: parseInt(item.statistics.commentCount || '0', 10),
      publishedAt: item.snippet.publishedAt,
      type: 'video',
      source: 'youtube',
      // Add metadata for filtering
      isTutorial: isTutorialVideo(item.snippet.title, item.snippet.description),
      isComprehensive: isComprehensiveVideo(item.snippet.title, item.snippet.description),
      isRecent: isRecentVideo(item.snippet.publishedAt)
    }));

    // Filter results to prioritize quality educational content
    let filteredResults = results;
    
    // Try to get high-quality recent tutorials first
    const highQualityTutorials = results.filter(video => 
      video.isTutorial && 
      video.viewCount > 5000 &&
      (video.likeCount / (video.viewCount || 1)) > 0.01 // At least 1% like ratio
    );
    
    if (highQualityTutorials.length >= 3) {
      filteredResults = highQualityTutorials;
    } else {
      // If not enough high-quality tutorials, try any tutorials
      const allTutorials = results.filter(video => video.isTutorial);
      if (allTutorials.length >= 3) {
        filteredResults = allTutorials;
      }
    }

    // Calculate a relevance score for each video based on views, likes, and other factors
    filteredResults.forEach(video => {
      // Calculate engagement rate (likes to views ratio)
      const engagementRate = video.viewCount > 0 ? (video.likeCount / video.viewCount) : 0;
      
      // Calculate recency score (1.0 for recent videos, lower for older ones)
      const ageInDays = getVideoDaysAge(video.publishedAt);
      const recencyScore = Math.max(0, 1 - (ageInDays / 730)); // Higher for newer videos (2 years baseline)
      
      // Calculate a quality score balancing multiple factors
      video.qualityScore = (
        (Math.log10(video.viewCount + 1) * 0.35) +     // View count (logarithmic scale)
        (engagementRate * 100 * 0.35) +                // Engagement rate
        (Math.log10(video.commentCount + 1) * 0.15) +  // Comment count
        (recencyScore * 0.15)                          // Recency factor
      );
      
      // Apply multipliers based on content characteristics
      
      // Boost score for tutorials
      if (video.isTutorial) {
        video.qualityScore *= 1.2;
      }
      
      // Boost score for comprehensive content 
      if (video.isComprehensive) {
        video.qualityScore *= 1.25;
      }
      
      // Boost score for recent content (less than 1 year old)
      if (ageInDays < 365) {
        video.qualityScore *= 1.1;
      }
    });

    // Sort by quality score (highest first)
    filteredResults.sort((a, b) => b.qualityScore - a.qualityScore);

    // Return top 5 results
    return filteredResults.slice(0, 5);
  } catch (error) {
    console.error('Error fetching from YouTube API:', error);
    return [];
  }
};

/**
 * Check if a video is likely a tutorial based on title and description
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @returns {boolean} - Whether it's likely a tutorial
 */
const isTutorialVideo = (title, description) => {
  const tutorialKeywords = [
    'tutorial', 'learn', 'course', 'training', 'guide', 'how to',
    'beginner', 'introduction', 'crash course', 'lesson', 'lecture'
  ];
  
  const combinedText = (title + ' ' + description).toLowerCase();
  
  return tutorialKeywords.some(keyword => combinedText.includes(keyword));
};

/**
 * Check if a video is recent (less than 2 years old)
 * @param {string} publishedAt - ISO date string
 * @returns {boolean} - Whether it's a recent video
 */
const isRecentVideo = (publishedAt) => {
  const publishDate = new Date(publishedAt);
  const currentDate = new Date();
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(currentDate.getFullYear() - 2);
  
  return publishDate > twoYearsAgo;
};

/**
 * Get age of video in days
 * @param {string} publishedAt - ISO date string
 * @returns {number} - Age in days
 */
const getVideoDaysAge = (publishedAt) => {
  const publishDate = new Date(publishedAt);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - publishDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Check if a video appears to be comprehensive based on title and description
 * @param {string} title - Video title
 * @param {string} description - Video description
 * @returns {boolean} - Whether it's likely comprehensive
 */
const isComprehensiveVideo = (title, description) => {
  const comprehensiveKeywords = [
    'complete', 'comprehensive', 'full', 'in-depth', 'masterclass',
    'certification', 'from zero to hero', 'bootcamp', 'master'
  ];
  
  const combinedText = (title + ' ' + description).toLowerCase();
  
  return comprehensiveKeywords.some(keyword => combinedText.includes(keyword));
};

/**
 * Format statistics to be more readable
 * Enhances the resources with formatted statistics
 * @param {Array} resources - Array of resources
 * @returns {Array} - Enhanced resources with formatted statistics
 */
const enhanceResourcesWithFormattedStats = (resources) => {
  return resources.map(resource => {
    if (resource.viewCount) {
      // Format view count (e.g., 1,234,567 -> 1.2M)
      resource.formattedViews = formatNumber(resource.viewCount);
      
      // Format like count
      resource.formattedLikes = formatNumber(resource.likeCount);
      
      // Add quality indicator
      if (resource.qualityScore > 15) {
        resource.qualityIndicator = 'Highly Recommended';
      } else if (resource.qualityScore > 10) {
        resource.qualityIndicator = 'Recommended';
      } else if (resource.qualityScore > 5) {
        resource.qualityIndicator = 'Good Resource';
      }
      
      // Format duration from ISO 8601 format
      if (resource.duration) {
        resource.formattedDuration = formatDuration(resource.duration);
      }
    }
    return resource;
  });
};

/**
 * Format a number to a readable string with K, M, B suffixes
 * @param {number} num - The number to format
 * @returns {string} - Formatted number
 */
const formatNumber = (num) => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format ISO 8601 duration to readable format
 * @param {string} duration - ISO 8601 duration string
 * @returns {string} - Formatted duration
 */
const formatDuration = (duration) => {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Get YouTube course recommendations based on target role
 * @param {string} targetRole - The user's target role
 * @returns {Array} - Array of course recommendations
 */
const getRecommendationsForRole = async (targetRole) => {
  try {
    // Initialize results array to hold role-based recommendations
    let recommendations = [];
    
    // Try to get real recommendations from YouTube API
    if (YOUTUBE_API_KEY) {
      // Craft a query that works well for role recommendations
      const query = `become a ${targetRole} career path`;
      
      // First try getting specific videos for this role
      const apiResults = await fetchFromYouTubeAPI(query, true);
      
      // If we got results from the API, add them to recommendations
      if (apiResults && apiResults.length > 0) {
        recommendations = recommendations.concat(
          enhanceResourcesWithFormattedStats(apiResults)
        );
      }
    }
    
    // Get Coursera courses for this role
    try {
      // Use a modified query to find better Coursera results
      const courseraQuery = `${targetRole} career path`;
      const courseraResults = await courseraService.searchCoursera(courseraQuery);
      
      if (courseraResults && courseraResults.length > 0) {
        recommendations = recommendations.concat(courseraResults);
      }
    } catch (courseraError) {
      console.error('Error fetching Coursera role recommendations:', courseraError);
      // Continue with what we have
    }
    
    // If we have enough recommendations, return them
    if (recommendations.length > 0) {
      return labelResourcesBySource(recommendations);
    }
    
    // If we don't have any recommendations, return empty array
    return [];
    
  } catch (error) {
    console.error('Error getting role recommendations:', error);
    // Return empty array instead of fallback
    return [];
  }
};

/**
 * Get YouTube course recommendations based on skill
 * @param {string} skillName - The skill name
 * @returns {Array} - Array of course recommendations
 */
const getRecommendationsForSkill = async (skillName) => {
  try {
    // Initialize results array to hold combined recommendations
    let recommendations = [];
    
    // Extract keywords from skill name for better matching
    const normalizedSkill = skillName.toLowerCase().trim();
    const skillKeywords = normalizedSkill.split(/\s+/).filter(word => 
      word.length > 2 && !['and', 'for', 'the', 'with'].includes(word)
    );
    
    // Determine if this is a compound skill
    const isCompoundSkill = skillKeywords.length > 1;
    
    // Special handling for RESTful APIs
    const isRestApi = normalizedSkill.includes('rest') && normalizedSkill.includes('api');
    
    // Use specific queries based on skill
    let queryAttempts = [normalizedSkill];
    
    // Add tutorial-specific queries
    queryAttempts.push(`${normalizedSkill} tutorial`);
    queryAttempts.push(`learn ${normalizedSkill}`);
    
    // Special case for Git
    if (normalizedSkill.includes('git') || normalizedSkill.includes('version control')) {
      queryAttempts = [
        'git version control tutorial',
        'git basics',
        'github tutorial for beginners'
      ];
    }
    
    // Special case for RESTful APIs
    if (isRestApi) {
      queryAttempts = [
        'restful api tutorial',
        'rest api design',
        'api development best practices'
      ];
    }
    
    // Try to get YouTube recommendations
    try {
      // Try to get real recommendations from YouTube API
      if (YOUTUBE_API_KEY) {
        // Try each query in the queryAttempts array
        for (const query of queryAttempts) {
          const apiResults = await fetchFromYouTubeAPI(query, true);
          if (apiResults && apiResults.length > 0) {
            // Filter for relevance and add them to recommendations
            const relevantResults = apiResults.filter(resource => {
              const title = (resource.title || '').toLowerCase();
              const description = (resource.description || '').toLowerCase();
              const content = title + ' ' + description;
              
              // Special handling for REST APIs
              if (isRestApi) {
                return content.includes('rest') && content.includes('api');
              }
              
              // For compound skills, require all significant keywords to be present
              if (isCompoundSkill) {
                return skillKeywords.every(keyword => content.includes(keyword));
              }
              
              // For single keyword skills, just check if one keyword is included
              return skillKeywords.some(keyword => content.includes(keyword));
            });
            
            if (relevantResults.length > 0) {
              recommendations = recommendations.concat(
                enhanceResourcesWithFormattedStats(relevantResults)
              );
              break;
            }
          }
        }
      }
    } catch (youtubeError) {
      console.error('Error fetching YouTube recommendations:', youtubeError);
      // Continue to try other sources
    }
    
    // Add Coursera courses to recommendations
    try {
      const courseraResults = await courseraService.getCoursesForSkill(skillName);
      if (courseraResults && courseraResults.length > 0) {
        // Apply relevance filtering to Coursera results
        const relevantCourseraResults = courseraResults.filter(resource => {
          const title = (resource.title || '').toLowerCase();
          const description = (resource.description || '').toLowerCase();
          
          // Check if the course content is relevant to the skill
          return skillKeywords.some(keyword => 
            title.includes(keyword) || description.includes(keyword)
          );
        });
        
        if (relevantCourseraResults.length > 0) {
          recommendations = recommendations.concat(relevantCourseraResults);
        }
      }
    } catch (courseraError) {
      console.error('Error fetching Coursera recommendations:', courseraError);
      // Continue with what we have
    }
    
    // If we don't have any recommendations at this point, return empty array
    if (recommendations.length === 0) {
      return [];
    }
    
    // Categorize and label resources by their source
    recommendations = labelResourcesBySource(recommendations);
    
    return recommendations;
  } catch (error) {
    console.error('Error getting skill recommendations:', error);
    // Return empty array instead of fallback
    return [];
  }
};

/**
 * Label resources by their source (YouTube, Coursera, etc.)
 * @param {Array} resources - Array of learning resources
 * @returns {Array} - Array of labeled resources
 */
const labelResourcesBySource = (resources) => {
  return resources.map(resource => {
    // If source is already specified, keep it
    if (resource.source) {
      return resource;
    }
    
    // Otherwise determine source based on URL or other properties
    if (resource.url && resource.url.includes('youtube.com')) {
      return { ...resource, source: 'youtube' };
    } else if (resource.url && resource.url.includes('coursera.org')) {
      return { ...resource, source: 'coursera' };
    } else if (resource.type === 'documentation') {
      return { ...resource, source: 'documentation' };
    } else {
      return { ...resource, source: 'web' };
    }
  });
};

/**
 * Generate dynamic resources for skills not in our predefined list
 * @param {string} skillName - The skill name
 * @returns {Array} - Array of generated resources
 */
const generateDynamicResources = (skillName) => {
  // Return empty array instead of generating dynamic resources
  return [];
};

/**
 * Search for learning resources across multiple platforms
 * @param {string} query - The search query 
 * @returns {Promise<Array>} - Array of search results
 */
async function searchYouTube(skill) {
  console.log(`Searching YouTube for skill: ${skill}`);
  const originalSkill = skill;
  skill = skill.toLowerCase();
  
  // Extract significant keywords from the skill
  const skillKeywords = skill.split(/\s+/).filter(k => 
    !['and', 'the', 'of', 'for', 'in', 'on', 'with', 'to'].includes(k)
  );
  
  // Determine if this is a compound skill (has multiple significant keywords)
  const isCompoundSkill = skillKeywords.length > 1;
  
  // Special handling for REST API
  const isRestApi = skill.includes('rest') && skill.includes('api');
  
  let recommendations = [];
  
  try {
    // First, try to get recommendations from Coursera
    console.log(`Checking if Coursera API key is configured...`);
    if (courseraService.isCourseraApiConfigured()) {
      try {
        console.log(`Searching Coursera for ${originalSkill}...`);
        const courseraResults = await courseraService.searchCoursera(originalSkill);
        
        if (courseraResults && courseraResults.length > 0) {
          console.log(`Found ${courseraResults.length} Coursera results for ${originalSkill}`);
          recommendations = recommendations.concat(courseraResults);
        } else {
          console.log(`No Coursera results found for ${originalSkill}`);
        }
      } catch (courseraError) {
        console.error('Error fetching from Coursera:', courseraError);
      }
    }
    
    // Next, try YouTube API if configured
    console.log(`Checking if YouTube API key is configured...`);
    if (YOUTUBE_API_KEY) {
      try {
        // Create search queries based on skill type
        let searchQueries = [];
        
        if (isRestApi) {
          console.log(`Detected REST API as special case`);
          searchQueries = [
            'RESTful API tutorial',
            'REST API design principles',
            'REST API best practices'
          ];
        } else if (isCompoundSkill) {
          console.log(`Detected compound skill with keywords: ${skillKeywords.join(', ')}`);
          // For compound skills, create targeted queries
          searchQueries = [
            `${skill} tutorial`,
            `learn ${skill} programming`,
            `${skill} for beginners`
          ];
        } else {
          console.log(`Detected single skill: ${skill}`);
          // For simple skills, use the skill directly
          searchQueries = [
            `${skill} tutorial`,
            `learn ${skill} programming`,
            `${skill} for beginners`
          ];
        }
        
        // Try each search query until we get results
        for (const query of searchQueries) {
          console.log(`Trying YouTube query: "${query}"`);
          const youtubeResults = await fetchFromYouTubeAPI(query);
          
          if (youtubeResults && youtubeResults.length > 0) {
            console.log(`Found ${youtubeResults.length} YouTube results for query "${query}"`);
            const enhancedResults = enhanceResourcesWithFormattedStats(youtubeResults);
            recommendations = recommendations.concat(enhancedResults);
            break; // Stop trying queries once we get results
          }
        }
      } catch (youtubeError) {
        console.error('Error fetching from YouTube:', youtubeError);
      }
    } else {
      console.log('YouTube API key not configured, skipping YouTube search');
    }
    
    // If we have enough recommendations, return them
    if (recommendations.length > 0) {
      console.log(`Returning ${recommendations.length} recommendations for ${originalSkill}`);
      return labelResourcesBySource(recommendations);
    }
    
    // Fallback to mock data if available
    console.log(`No recommendations found, checking fallback data for ${originalSkill}`);
    const normalizedSkill = skill.replace(/\s+/g, '');
    if (skillBasedCourses[originalSkill]) {
      console.log(`Found fallback data for ${originalSkill}`);
      return skillBasedCourses[originalSkill];
    }
    
    // Check for partial matches in skillBasedCourses
    for (const key in skillBasedCourses) {
      if (key.toLowerCase().includes(skill) || skill.includes(key.toLowerCase())) {
        console.log(`Found partial match in fallback data: ${key}`);
        return skillBasedCourses[key];
      }
    }
    
    // Last resort - return empty array
    console.log(`No recommendations found for ${originalSkill}`);
    return [];
  } catch (error) {
    console.error('Error in searchYouTube function:', error);
    return [];
  }
}

module.exports = {
  getRecommendationsForRole,
  getRecommendationsForSkill,
  searchYouTube,
  labelResourcesBySource
}; 