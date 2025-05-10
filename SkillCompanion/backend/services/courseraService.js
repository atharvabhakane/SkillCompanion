const axios = require('axios');
require('dotenv').config();

/**
 * Coursera API Service
 * Fetches course information from Coursera API
 */

// Coursera API configuration
const COURSERA_API_KEY = process.env.COURSERA_API_KEY || '';
const COURSERA_API_URL = 'https://api.coursera.org/api/courses.v1';
const COURSERA_PARTNERS_URL = 'https://api.coursera.org/api/partners.v1';

// Skill expansion map to improve search results
const skillToExpandedTermsMap = {
  'javascript': 'javascript programming web development',
  'python': 'python programming data science',
  'java': 'java programming software development',
  'react': 'react javascript frontend web development',
  'node.js': 'node.js javascript backend web development',
  'html': 'html css web development frontend',
  'css': 'css html web design frontend',
  'sql': 'sql database data management',
  'machine learning': 'machine learning artificial intelligence data science',
  'data science': 'data science analytics statistics',
  'cloud computing': 'cloud computing aws azure devops',
  'devops': 'devops continuous integration deployment',
  'git': 'git version control github',
  'agile': 'agile scrum project management',
  'ui/ux': 'ui ux design user interface experience',
  'rest api': 'rest api web services http',
  'react native': 'react native mobile app development',
  'flutter': 'flutter dart mobile app development',
  'vue': 'vue.js javascript frontend framework',
  'angular': 'angular typescript frontend framework'
};

// Keep a small set of mock data for when API is unavailable
const skillBasedCourses = {
  'JavaScript': [
    {
      title: 'JavaScript: Getting Started',
      url: 'https://www.coursera.org/learn/javascript',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png',
      author: 'Johns Hopkins University',
      description: 'Learn the fundamentals of JavaScript, the programming language of the Web.',
      duration: '4 weeks',
      source: 'coursera'
    },
    {
      title: 'Interactivity with JavaScript',
      url: 'https://www.coursera.org/learn/javascript-interactivity',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/59/2c65f0532611e580ee493561a63326/jhep-coursera-course3.png',
      author: 'University of Michigan',
      description: 'Learn to use JavaScript to make your web pages interactive.',
      duration: '4 weeks',
      source: 'coursera'
    }
  ],
  'Python': [
    {
      title: 'Programming for Everybody (Getting Started with Python)',
      url: 'https://www.coursera.org/learn/python',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/08/33f720502a11e59e72391aa537f5c9/pythonlearn_thumbnail_1x1.png',
      author: 'University of Michigan',
      description: 'This course aims to teach everyone the basics of programming computers using Python.',
      duration: '7 weeks',
      source: 'coursera'
    },
    {
      title: 'Crash Course on Python',
      url: 'https://www.coursera.org/learn/python-crash-course',
      thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/16/d602b00a6b11e88d594f951694ab88/Python-thumbnail.png',
      author: 'Google',
      description: 'A hands-on introduction to Python for beginners in IT.',
      duration: '6 weeks',
      source: 'coursera'
    }
  ]
};

/**
 * Make a proper API call to Coursera API
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of course results
 */
const fetchFromCourseraAPI = async (query) => {
  if (!COURSERA_API_KEY) {
    console.error('Coursera API key is not configured in environment variables');
    throw new Error('Coursera API key is not configured');
  }
  
  console.log(`Attempting to fetch courses from Coursera API for query: "${query}" using API key: ${COURSERA_API_KEY.substring(0, 5)}...`);
  
  try {
    // First get a list of courses (listing courses with API works)
    const response = await axios.get(COURSERA_API_URL, {
      params: {
        fields: 'name,slug,description,photoUrl,partnerIds,certificates,workload,primaryLanguages,courseType,skills',
        limit: 50,
        api_key: COURSERA_API_KEY
      },
      headers: {
        'Authorization': 'Bearer ' + COURSERA_API_KEY,
        'Accept': 'application/json'
      }
    });
    
    console.log(`Coursera API response received. Status: ${response.status}, Found ${response.data?.elements?.length || 0} courses`);
    
    if (!response.data || !response.data.elements || response.data.elements.length === 0) {
      console.log('No courses found in Coursera API response, returning empty array');
      return [];
    }
    
    // Filter courses based on query
    let courses = response.data.elements;
    
    // Apply a more flexible text-based search on the course name and description
    if (query) {
      const normalizedQuery = query.toLowerCase();
      const queryKeywords = normalizedQuery.split(/\s+/).filter(k => k.length > 2);
      
      courses = courses.filter(course => {
        const title = (course.name || '').toLowerCase();
        const description = (course.description || '').toLowerCase();
        
        // Check if ANY of the keywords are present in title or description
        return queryKeywords.some(keyword => 
          title.includes(keyword) || description.includes(keyword)
        );
      });
      
      console.log(`Filtered courses based on query "${query}": ${courses.length} matches`);
    }
    
    // Filter courses by language preference - prioritize English courses
    const englishCourses = courses.filter(course => 
      course.primaryLanguages && course.primaryLanguages.includes("en")
    );
    
    // If we have enough English courses, use those; otherwise, use all courses
    if (englishCourses.length >= 3) {
      courses = englishCourses;
      console.log(`Using ${courses.length} English language courses`);
    }
    
    // Skip partner information for now (we can get course info directly)
    
    // Process and enhance course data
    courses = courses.map(course => {
      // Skip courses without a slug (we can't create a direct link)
      if (!course.slug) {
        return null;
      }
      
      // Format and improve description
      let description = course.description || `Learn about ${query} with this Coursera course`;
      if (description.length > 200) {
        description = description.substring(0, 197) + '...';
      }
      
      // Clean up the title - remove any excessive punctuation or formatting issues
      let title = course.name;
      if (title) {
        // Remove any trailing colons or dashes
        title = title.replace(/[:|-]+ *$/, '');
        // Capitalize the first letter of each word for consistency
        title = title.replace(/\b\w/g, c => c.toUpperCase());
      }
      
      // Calculate relevance based on query match
      const normalizedTitle = (title || '').toLowerCase();
      const normalizedDesc = (description || '').toLowerCase();
      const normalizedQuery = query.toLowerCase();
      
      // Exact match in title is highest score
      const exactTitleMatch = normalizedTitle === normalizedQuery ? 50 : 0;
      
      // Word boundary matches (whole word match) score high
      const titleWordMatch = new RegExp('\\b' + normalizedQuery + '\\b', 'i').test(normalizedTitle) ? 30 : 0;
      const descWordMatch = new RegExp('\\b' + normalizedQuery + '\\b', 'i').test(normalizedDesc) ? 15 : 0;
      
      // Partial matches score lower but still count
      const titlePartialMatch = normalizedTitle.includes(normalizedQuery) ? 20 : 0;
      const descPartialMatch = normalizedDesc.includes(normalizedQuery) ? 10 : 0;
      
      // Individual keywords from the query (for multi-word queries)
      const queryWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2);
      
      // Score how many query keywords appear in title and description
      const titleKeywordMatches = queryWords.filter(word => normalizedTitle.includes(word)).length;
      const descKeywordMatches = queryWords.filter(word => normalizedDesc.includes(word)).length;
      
      // Calculate keyword match scores
      const titleKeywordScore = titleKeywordMatches * 8;
      const descKeywordScore = descKeywordMatches * 4;
      
      // Skill matches (if the course has skills that match query)
      const skillMatch = course.skills ? 
        course.skills.filter(skill => skill.toLowerCase().includes(normalizedQuery)).length * 20 : 0;
      
      // Verify this is a valid course with a direct link (not a specialization or professional certificate)
      let courseType = 'REGULAR_COURSE';
      let directLink = `https://www.coursera.org/learn/${course.slug}`;
      
      if (course.courseType === 'SPECIALIZATION') {
        courseType = 'SPECIALIZATION';
        directLink = `https://www.coursera.org/specializations/${course.slug}`;
      } else if (course.courseType === 'PROFESSIONAL_CERTIFICATE') {
        courseType = 'PROFESSIONAL_CERTIFICATE';
        directLink = `https://www.coursera.org/professional-certificates/${course.slug}`;
      } else if (course.courseType === 'GUIDED_PROJECT') {
        courseType = 'GUIDED_PROJECT';
        directLink = `https://www.coursera.org/projects/${course.slug}`;
      }
      
      // Calculate the total relevance score
      const relevanceScore = exactTitleMatch + titleWordMatch + descWordMatch + 
                             titlePartialMatch + descPartialMatch + 
                             titleKeywordScore + descKeywordScore + skillMatch;
      
      // Use university/institution names for the author if available
      const universities = {
        "stanford": "Stanford University",
        "google": "Google",
        "duke": "Duke University",
        "michigan": "University of Michigan",
        "penn": "University of Pennsylvania",
        "ibm": "IBM",
        "imperial": "Imperial College London",
        "jhu": "Johns Hopkins University",
        "illinois": "University of Illinois",
        "hec": "HEC Paris",
        "berkeley": "UC Berkeley"
      };
      
      // Default author
      let author = "Coursera";
      
      // Check for known institutions in the course slug or title
      const courseText = (course.slug + " " + (title || "")).toLowerCase();
      for (const [key, value] of Object.entries(universities)) {
        if (courseText.includes(key)) {
          author = value;
          break;
        }
      }
      
      return {
        title: title,
        url: directLink,
        thumbnail: course.photoUrl || 'https://coursera-university-assets.s3.amazonaws.com/70/de505d47be7d3a063b51b6f856a6e2/New-Block-M-Stacked-Blue-295C_600x600.png',
        author: author,
        description: description,
        duration: course.workload || '4-6 weeks',
        languages: course.primaryLanguages || ['English'],
        courseType: courseType,
        skills: course.skills || [],
        relevanceScore: relevanceScore,
        // Add metadata for filtering
        isBeginner: isBeginner(course.name, course.description),
        isComprehensive: isComprehensive(course.name, course.description),
        isCertified: course.certificates && course.certificates.length > 0,
        source: 'coursera'
      };
    }).filter(course => course !== null);
    
    // Check if we have courses after filtering
    if (courses.length === 0) {
      console.log(`No courses match the query "${query}" after filtering, returning empty array`);
      return [];
    }
    
    // Apply additional relevance filtering - courses must have at least some relevance
    const minRelevanceScore = 5; // Set a minimum relevance threshold
    const relevantCourses = courses.filter(course => course.relevanceScore >= minRelevanceScore);
    
    if (relevantCourses.length === 0) {
      console.log(`No highly relevant courses found for "${query}"`);
      
      // Apply course type filtering (prefer regular courses and specializations)
      const typePriorityCourses = courses.filter(
        course => course.courseType === 'REGULAR_COURSE' || course.courseType === 'SPECIALIZATION'
      );
      
      if (typePriorityCourses.length > 0) {
        console.log(`Found ${typePriorityCourses.length} courses by type priority`);
        courses = typePriorityCourses;
      }
    } else {
      console.log(`Found ${relevantCourses.length} relevant courses for "${query}"`);
      courses = relevantCourses;
    }
    
    // Additional filtering for course quality
    courses = courses.filter(course => {
      // Filter out courses with incomplete information
      if (!course.title || !course.description || !course.thumbnail) {
        return false;
      }
      
      // Make sure the course title isn't too short or generic
      if (course.title.length < 5) {
        return false;
      }
      
      // Make sure the description isn't too short
      if (course.description.length < 20) {
        return false;
      }
      
      return true;
    });
    
    // Calculate final quality score with simplified criteria
    courses.forEach(course => {
      let qualityScore = course.relevanceScore;
      
      // Boost score for beginner-friendly content if it matches the query pattern
      if (query.toLowerCase().includes('beginner') || query.toLowerCase().includes('introduction')) {
        if (course.isBeginner) {
          qualityScore *= 1.5;
        }
      }
      
      // Boost score for comprehensive content
      if (course.isComprehensive) {
        qualityScore *= 1.3;
      }
      
      // Boost score for certified courses
      if (course.isCertified) {
        qualityScore *= 1.2;
      }
      
      // Boost score for 'normal' courses over guided projects
      if (course.courseType === 'REGULAR_COURSE') {
        qualityScore *= 1.1;
      }
      
      // Boost score for specializations (these are typically high-quality)
      if (course.courseType === 'SPECIALIZATION') {
        qualityScore *= 1.3;
      }
      
      // Boost score if the title directly contains the query (exact match)
      if (course.title.toLowerCase().includes(query.toLowerCase())) {
        qualityScore *= 1.5;
      }
      
      course.qualityScore = qualityScore;
    });
    
    // Sort by quality score (highest first)
    courses.sort((a, b) => b.qualityScore - a.qualityScore);
    
    // Return top results (the absolute best matches)
    return courses.slice(0, 5);
  } catch (error) {
    console.error('Error fetching from Coursera API:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Coursera API error response data:', error.response.data);
      console.error('Coursera API error response status:', error.response.status);
      console.error('Coursera API error response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Coursera API error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Coursera API error config:', error.config);
    }
    console.error(error.stack);
    return [];
  }
};

/**
 * Check if a course appears to be beginner-friendly
 * @param {string} title - Course title
 * @param {string} description - Course description
 * @returns {boolean} - Whether it's likely a beginner course
 */
const isBeginner = (title, description) => {
  const beginnerKeywords = [
    'beginner', 'introduction', 'intro ', 'getting started', 'basics', 'fundamental',
    'novice', 'newcomer', 'start', 'first step', '101', 'basic', 'beginner-friendly'
  ];
  
  const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
  
  return beginnerKeywords.some(keyword => combinedText.includes(keyword));
};

/**
 * Check if a course appears to be comprehensive
 * @param {string} title - Course title
 * @param {string} description - Course description
 * @returns {boolean} - Whether it's likely a comprehensive course
 */
const isComprehensive = (title, description) => {
  const comprehensiveKeywords = [
    'comprehensive', 'complete', 'specialization', 'professional', 'certificate',
    'certification', 'in-depth', 'masterclass', 'bootcamp', 'immersive', 'intensive', 'mastery'
  ];
  
  const combinedText = `${title || ''} ${description || ''}`.toLowerCase();
  
  return comprehensiveKeywords.some(keyword => combinedText.includes(keyword));
};

/**
 * Search for courses on Coursera API
 * @param {string} query - The search query
 * @returns {Promise<Array>} - Array of course results
 */
const searchCoursera = async (query) => {
  const apiKey = process.env.COURSERA_API_KEY;
  if (!apiKey) {
    console.log('Coursera API key not found, using mock data');
    return getMockCourseraData();
  }

  console.log(`Searching Coursera for: "${query}"`);
  
  // Get expanded search terms if available
  let queryToUse = query;
  const normalizedQuery = query.toLowerCase().trim();
  
  if (skillToExpandedTermsMap[normalizedQuery]) {
    queryToUse = skillToExpandedTermsMap[normalizedQuery];
    console.log(`Using expanded search terms for "${query}": "${queryToUse}"`);
  }
  
  // Detect domain category if possible
  const domain = detectDomainCategory(normalizedQuery);
  if (domain) {
    console.log(`Detected domain category: ${domain}`);
  }

  console.log('Coursera API key is configured, attempting API call');
  try {
    console.log(`Attempting to fetch courses from Coursera API for query: "${queryToUse}" using API key: ${apiKey.substring(0, 5)}...`);
    const url = 'https://api.coursera.org/api/courses.v1';
    const response = await axios.get(url, {
      params: {
        q: 'search',
        query: queryToUse,
        limit: 50,
        fields: 'name,slug,photoUrl,description,workload,primaryLanguages',
      },
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    console.log(`Coursera API response received. Status: ${response.status}, Found ${response.data.elements.length} courses`);
    
    // Filter courses based on relevance to the query
    const filteredCourses = filterCoursesByRelevance(response.data.elements, queryToUse, normalizedQuery, domain);
    console.log(`Filtered courses based on query "${queryToUse}": ${filteredCourses.length} matches`);
    
    // Filter for English language courses
    const englishCourses = filteredCourses.filter(course => 
      course.primaryLanguages && course.primaryLanguages.includes('en'));
    console.log(`Using ${englishCourses.length} English language courses`);
    
    // Format the results
    const formattedResults = englishCourses.slice(0, 5).map(course => ({
      title: course.name,
      url: `https://www.coursera.org/learn/${course.slug}`,
      source: 'Coursera',
      thumbnail: course.photoUrl || 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera.s3.amazonaws.com/media/coursera-logo-square.png',
      description: course.description?.substring(0, 150) + '...' || 'No description available',
      relevanceScore: course.relevanceScore || 0,
      qualityScore: course.qualityScore || 0,
    }));
    
    console.log(`Found ${formattedResults.length} relevant courses for "${queryToUse}"`);
    
    // Log the top results for debugging
    console.log('=== TOP COURSERA RESULTS ===');
    formattedResults.forEach((course, index) => {
      console.log(`${index + 1}. "${course.title}" - Relevance: ${course.relevanceScore.toFixed(2)}, Quality: ${course.qualityScore.toFixed(2)}`);
      console.log(`   Description: ${course.description.substring(0, 100)}...`);
    });
    console.log('============================');
    
    console.log(`Found ${formattedResults.length} relevant courses from Coursera API for query "${query}"`);
    return formattedResults;
  } catch (error) {
    console.error('Error fetching Coursera data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    console.log('Falling back to mock data due to API error');
    return getMockCourseraData();
  }
};

/**
 * Get course recommendations for a skill
 * @param {string} skillName - The skill name
 * @returns {Promise<Array>} - Array of recommended courses
 */
const getCoursesForSkill = async (skillName) => {
  try {
    // Normalize skill name and extract keywords
    const normalizedSkill = skillName.toLowerCase().trim();
    const skillKeywords = normalizedSkill.split(/\s+/).filter(word => 
      word.length > 2 && !['and', 'for', 'the', 'with'].includes(word)
    );
    
    // Check if this is a compound skill (multiple significant words)
    const isCompoundSkill = skillKeywords.length > 1;
    
    // Special case for RESTful APIs
    if (normalizedSkill.includes('rest') || normalizedSkill.includes('api')) {
      // Try specialized REST API queries
      const restApiQueries = [
        'restful api design',
        'rest api development',
        'building rest apis',
        'api design principles',
        'restful web services'
      ];
      
      let apiResults = [];
      
      // Try each specialized query for REST APIs
      for (const apiQuery of restApiQueries) {
        try {
          const results = await searchCoursera(apiQuery);
          if (results && results.length > 0) {
            // Filter to ensure high-relevance results for REST APIs
            const relevantResults = results.filter(course => {
              const title = (course.title || '').toLowerCase();
              const description = (course.description || '').toLowerCase();
              
              // Must contain both "rest" and "api" terms in title or description
              const hasRest = title.includes('rest') || description.includes('rest');
              const hasApi = title.includes('api') || description.includes('api');
              
              return hasRest && hasApi;
            });
            
            if (relevantResults.length > 0) {
              apiResults = [...apiResults, ...relevantResults.filter(result => 
                !apiResults.some(existingResult => existingResult.url === result.url)
              )];
              
              if (apiResults.length >= 5) break;
            }
          }
        } catch (error) {
          console.error(`Error with REST API query "${apiQuery}":`, error.message);
        }
      }
      
      // If we found REST API-specific courses, sort and return them
      if (apiResults.length > 0) {
        // Calculate relevance scores
        apiResults.forEach(course => {
          let relevanceScore = course.qualityScore || 1;
          
          // Boost score based on title/description match quality
          const title = (course.title || '').toLowerCase();
          const description = (course.description || '').toLowerCase();
          
          if (title.includes('rest') && title.includes('api')) {
            relevanceScore *= 2.0; // Perfect match
          } else if (title.includes('restful')) {
            relevanceScore *= 1.8; // Strong match
          } else if (title.includes('api') && description.includes('rest')) {
            relevanceScore *= 1.5; // Good match
          }
          
          course.qualityScore = relevanceScore;
        });
        
        // Sort by quality score
        apiResults.sort((a, b) => b.qualityScore - a.qualityScore);
        
        // Return top 5
        return apiResults.slice(0, 5);
      }
    }
    
    // Special case for Git & Version Control
    if (normalizedSkill.includes('git') || normalizedSkill.includes('version control')) {
      // Try specialized Git queries
      const gitQueries = [
        'git version control course',
        'github fundamentals',
        'git source control management',
        'version control systems'
      ];
      
      let gitResults = [];
      
      // Try each specialized query for Git
      for (const gitQuery of gitQueries) {
        try {
          const results = await searchCoursera(gitQuery);
          if (results && results.length > 0) {
            // Filter to ensure high-relevance results
            const relevantResults = results.filter(course => {
              const title = (course.title || '').toLowerCase();
              const description = (course.description || '').toLowerCase();
              return title.includes('git') || description.includes('git') || 
                     title.includes('version control') || description.includes('version control');
            });
            
            if (relevantResults.length > 0) {
              gitResults = [...gitResults, ...relevantResults.filter(result => 
                !gitResults.some(existingResult => existingResult.url === result.url)
              )];
              
              if (gitResults.length >= 5) break;
            }
          }
        } catch (error) {
          console.error(`Error with Git query "${gitQuery}":`, error.message);
        }
      }
      
      // If we found Git-specific courses, sort and return them
      if (gitResults.length > 0) {
        // Calculate relevance scores
        gitResults.forEach(course => {
          let relevanceScore = course.qualityScore || 1;
          
          // Boost score based on title/description match quality
          const title = (course.title || '').toLowerCase();
          const description = (course.description || '').toLowerCase();
          
          if (title.includes('git') && title.includes('version control')) {
            relevanceScore *= 2.0; // Perfect match
          } else if (title.includes('git')) {
            relevanceScore *= 1.5; // Strong match
          } else if (description.includes('git') && description.includes('version control')) {
            relevanceScore *= 1.3; // Good match
          }
          
          course.qualityScore = relevanceScore;
        });
        
        // Sort by quality score
        gitResults.sort((a, b) => b.qualityScore - a.qualityScore);
        
        // Return top 5
        return gitResults.slice(0, 5);
      }
    }
    
    // Use a variety of high-quality search queries
    const primaryQuery = `${skillName} course`;
    
    // Different query patterns to find the best matching courses
    const queries = [
      primaryQuery,
      `${skillName} specialization`,
      `learn ${skillName}`,
      `${skillName} certificate`,
      `${skillName} professional`,
      `best ${skillName} course`
    ];
    
    let allResults = [];
    let attempts = 0;
    
    // Try each query until we get enough high-quality results
    for (const query of queries) {
      // Limit the number of API calls to prevent excessive requests
      if (attempts >= 3) break;
      attempts++;
      
      // Skip additional queries if we already have enough high-quality results
      if (allResults.length >= 8) break;
      
      try {
        const results = await searchCoursera(query);
        
        if (results && results.length > 0) {
          // Filter for strict relevance to the skill
          const strictlyRelevant = results.filter(course => {
            const title = (course.title || '').toLowerCase();
            const description = (course.description || '').toLowerCase();
            
            // For compound skills (like "RESTful APIs"), all keywords must be present
            if (isCompoundSkill) {
              // Check if ALL key terms are present somewhere in the course content
              return skillKeywords.every(keyword => 
                title.includes(keyword) || description.includes(keyword)
              );
            } else {
              // For single skills, at least one keyword must be present
              return skillKeywords.some(keyword => 
                title.includes(keyword) || description.includes(keyword)
              );
            }
          });
          
          if (strictlyRelevant.length > 0) {
            // Filter out duplicates
            const newResults = strictlyRelevant.filter(result => 
              !allResults.some(existingResult => existingResult.url === result.url)
            );
            
            allResults = [...allResults, ...newResults];
          }
        }
      } catch (error) {
        console.error(`Error with Coursera query "${query}":`, error.message);
        // Continue with next query
      }
    }
    
    // If we have results, sort them by quality and return the best ones
    if (allResults.length > 0) {
      // Re-calculate relevance specifically for the skill name (not the search query)
      allResults.forEach(course => {
        // Boost score if course title or description directly mentions the skill
        const title = (course.title || '').toLowerCase();
        const description = (course.description || '').toLowerCase();
        let newScore = course.qualityScore || 1;
        
        // For compound skills, check if ALL terms are found
        if (isCompoundSkill) {
          const titleMatchCount = skillKeywords.filter(keyword => title.includes(keyword)).length;
          const descMatchCount = skillKeywords.filter(keyword => description.includes(keyword)).length;
          
          // Perfect match: all keywords in title
          if (titleMatchCount === skillKeywords.length) {
            newScore *= 2.0;
          }
          // Strong match: some keywords in title, rest in description
          else if (titleMatchCount > 0 && (titleMatchCount + descMatchCount) >= skillKeywords.length) {
            newScore *= 1.5;
          }
          // Basic match: all keywords across title and description
          else if ((titleMatchCount + descMatchCount) >= skillKeywords.length) {
            newScore *= 1.2;
          }
        } else {
          // Calculate match quality for single-term skills
          const titleMatch = skillKeywords.filter(keyword => title.includes(keyword)).length;
          const descMatch = skillKeywords.filter(keyword => description.includes(keyword)).length;
          
          // Apply boosts
          if (titleMatch > 0) {
            newScore *= (1 + titleMatch * 0.3); // 30% boost per keyword in title
          }
          
          if (descMatch > 0) {
            newScore *= (1 + descMatch * 0.1); // 10% boost per keyword in description
          }
        }
        
        course.qualityScore = newScore;
        
        // Add an indicator that this is a top course for the skill
        course.isTopPickForSkill = true;
      });
      
      // Sort by final quality score
      allResults.sort((a, b) => b.qualityScore - a.qualityScore);
      
      // Return top 5 highest quality results
      return allResults.slice(0, 5);
    }
    
    // Return empty array if no results were found
    return [];
  } catch (error) {
    console.error(`Error getting Coursera courses for ${skillName}:`, error);
    return [];
  }
};

/**
 * Get fallback courses when API is unavailable
 * @param {string} query - The search query (skill name)
 * @returns {Array} - Array of mock courses
 */
const getFallbackCourses = (query) => {
  // Normalize the query
  const normalizedQuery = query.toLowerCase();
  
  // First check for specific high-demand skills with direct course links
  
  // SQL-related skills
  if (normalizedQuery.includes('sql') || normalizedQuery.includes('database') || normalizedQuery.includes('data science')) {
    return [
      {
        title: 'SQL for Data Science',
        url: 'https://www.coursera.org/learn/sql-for-data-science',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/da/34f6501aa311e7b1c223a6adb987da/SQl_thumnail.png',
        author: 'University of California, Davis',
        description: 'Learn how to use SQL effectively for data science applications. Great for analyzing data in relational databases.',
        duration: '4 weeks',
        source: 'coursera'
      },
      {
        title: 'Databases and SQL for Data Science with Python',
        url: 'https://www.coursera.org/learn/sql-data-science',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/16/d602b00a6b11e88d594f951694ab88/Python-thumbnail.png',
        author: 'IBM',
        description: 'Work with real databases, real data science tools, and real-world datasets to solve practical problems.',
        duration: '5 weeks',
        source: 'coursera'
      },
      {
        title: 'PostgreSQL for Everybody Specialization',
        url: 'https://www.coursera.org/specializations/postgresql-for-everybody',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/b8/94e3f0682511e6b99fa9e79310bb09/Machine-Learning-CroppedforCoursera.png',
        author: 'University of Michigan',
        description: 'Learn PostgreSQL - a powerful, open-source object-relational database system with advanced features.',
        duration: '3 months',
        source: 'coursera'
      }
    ];
  }
  
  // Python-related skills
  if (normalizedQuery.includes('python') || normalizedQuery.includes('programming')) {
    return [
      {
        title: 'Programming for Everybody (Getting Started with Python)',
        url: 'https://www.coursera.org/learn/python',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/08/33f720502a11e59e72391aa537f5c9/pythonlearn_thumbnail_1x1.png',
        author: 'University of Michigan',
        description: 'This course aims to teach everyone the basics of programming computers using Python.',
        duration: '7 weeks',
        source: 'coursera'
      },
      {
        title: 'Crash Course on Python',
        url: 'https://www.coursera.org/learn/python-crash-course',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/16/d602b00a6b11e88d594f951694ab88/Python-thumbnail.png',
        author: 'Google',
        description: 'A hands-on introduction to Python for beginners in IT.',
        duration: '6 weeks',
        source: 'coursera'
      },
      {
        title: 'Applied Data Science with Python Specialization',
        url: 'https://www.coursera.org/specializations/data-science-python',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://d15cw65ipctsrr.cloudfront.net/eb/8e18e0a4ff11e5b25f51bf1670159b/Applied-Data-Science-with-Python1.png',
        author: 'University of Michigan',
        description: 'Gain new insights into your data using Python and advanced techniques.',
        duration: '5 months',
        source: 'coursera'
      }
    ];
  }
  
  // JavaScript and web development
  if (normalizedQuery.includes('javascript') || normalizedQuery.includes('web') || normalizedQuery.includes('html') || normalizedQuery.includes('css')) {
    return [
      {
        title: 'JavaScript: Getting Started',
        url: 'https://www.coursera.org/learn/javascript',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png',
        author: 'Johns Hopkins University',
        description: 'Learn the fundamentals of JavaScript, the programming language of the Web.',
        duration: '4 weeks',
        source: 'coursera'
      },
      {
        title: 'HTML, CSS, and Javascript for Web Developers',
        url: 'https://www.coursera.org/learn/html-css-javascript-for-web-developers',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png',
        author: 'Johns Hopkins University',
        description: 'Learn the basics of web development and create responsive websites.',
        duration: '5 weeks',
        source: 'coursera'
      },
      {
        title: 'Full-Stack Web Development with React Specialization',
        url: 'https://www.coursera.org/specializations/full-stack-react',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/69/354af0135b11e88d594f951694ab88/Course2_HTML-CSS-JavaScript.png',
        author: 'The Hong Kong University of Science and Technology',
        description: 'Build complete web solutions with front-end and back-end technologies.',
        duration: '3 months',
        source: 'coursera'
      }
    ];
  }
  
  // Data Science and Machine Learning
  if (normalizedQuery.includes('data science') || normalizedQuery.includes('machine learning') || normalizedQuery.includes('ai') || normalizedQuery.includes('artificial intelligence')) {
    return [
      {
        title: 'Machine Learning',
        url: 'https://www.coursera.org/learn/machine-learning',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/b8/94e3f0682511e6b99fa9e79310bb09/Machine-Learning-CroppedforCoursera.png',
        author: 'Stanford University',
        description: 'Learn fundamental machine learning algorithms and techniques.',
        duration: '11 weeks',
        source: 'coursera'
      },
      {
        title: 'Deep Learning Specialization',
        url: 'https://www.coursera.org/specializations/deep-learning',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/b9/09f8a0ea2611e79b598e8efde54a34/Neural-thumb_1x1.png',
        author: 'deeplearning.ai',
        description: 'Master deep learning techniques and applications.',
        duration: '3 months',
        source: 'coursera'
      },
      {
        title: 'IBM Data Science Professional Certificate',
        url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/b3/9be8c0b16c11e88d594f951694ab88/IBM_image.png',
        author: 'IBM',
        description: 'Prepare for a career in data science with practical skills and tools.',
        duration: '10 months',
        source: 'coursera'
      }
    ];
  }
  
  // Check if we have predefined courses for this skill
  for (const [skill, courses] of Object.entries(skillBasedCourses)) {
    if (normalizedQuery.includes(skill.toLowerCase())) {
      return courses;
    }
  }
  
  // Popular courses by skill area that we can recommend for similar skills
  const popularCoursesByCategory = {
    // Programming and Development courses
    'programming': [
      {
        title: 'Programming for Everybody (Getting Started with Python)',
        url: 'https://www.coursera.org/learn/python',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/08/33f720502a11e59e72391aa537f5c9/pythonlearn_thumbnail_1x1.png',
        author: 'University of Michigan',
        description: 'This course is a great starting point for learning programming skills.',
        duration: '7 weeks',
        source: 'coursera'
      },
      {
        title: 'Web Development with HTML, CSS, JavaScript',
        url: 'https://www.coursera.org/learn/html-css-javascript-for-web-developers',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/83/e258e0532611e5a5072321239ff4d4/jhep-coursera-course4.png',
        author: 'Johns Hopkins University',
        description: 'Learn the basics of web development and create responsive websites.',
        duration: '5 weeks',
        source: 'coursera'
      },
      {
        title: 'Object Oriented Programming in Java',
        url: 'https://www.coursera.org/learn/object-oriented-java',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/da/95de309b3311e4b7f973caccd5568d/java-1.jpg',
        author: 'University of California San Diego',
        description: 'Learn object-oriented programming principles and design patterns in Java.',
        duration: '6 weeks',
        source: 'coursera'
      }
    ],
    // Data Science and Analytics courses
    'data': [
      {
        title: 'Data Science Specialization',
        url: 'https://www.coursera.org/specializations/jhu-data-science',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/33/6fbbe01e8e11e8a2578d9ed76919c1/toolbox2.png',
        author: 'Johns Hopkins University',
        description: 'Master the tools and techniques for data science and analytics.',
        duration: '8 months',
        source: 'coursera'
      },
      {
        title: 'Applied Data Science with Python',
        url: 'https://www.coursera.org/specializations/data-science-python',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/73/7cdb60f76c11e88d94879b6c7d83ee/Data-Science-Methodology_Coursera_Tag.png',
        author: 'University of Michigan',
        description: 'Apply statistical, machine learning, information visualization techniques to data analysis.',
        duration: '5 months',
        source: 'coursera'
      },
      {
        title: 'IBM Data Science Professional Certificate',
        url: 'https://www.coursera.org/professional-certificates/ibm-data-science',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/b3/9be8c0b16c11e88d594f951694ab88/IBM_image.png',
        author: 'IBM',
        description: 'Prepare for a career in data science with practical skills and tools.',
        duration: '10 months',
        source: 'coursera'
      }
    ],
    // Machine Learning and AI courses
    'ai': [
      {
        title: 'Machine Learning',
        url: 'https://www.coursera.org/learn/machine-learning',
        thumbnail: 'https://s3.amazonaws.com/coursera-course-photos/b8/94e3f0682511e6b99fa9e79310bb09/Machine-Learning-CroppedforCoursera.png',
        author: 'Stanford University',
        description: 'Learn fundamental machine learning algorithms and techniques.',
        duration: '11 weeks',
        source: 'coursera'
      },
      {
        title: 'Deep Learning Specialization',
        url: 'https://www.coursera.org/specializations/deep-learning',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/b9/09f8a0ea2611e79b598e8efde54a34/Neural-thumb_1x1.png',
        author: 'deeplearning.ai',
        description: 'Master deep learning techniques and applications.',
        duration: '3 months',
        source: 'coursera'
      },
      {
        title: 'AI For Everyone',
        url: 'https://www.coursera.org/learn/ai-for-everyone',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/fe/01c9b0bb9411e8bcf691a6b12667b/AI.png',
        author: 'deeplearning.ai',
        description: 'Understand AI technologies and their business applications.',
        duration: '4 weeks',
        source: 'coursera'
      }
    ],
    // Business and Project Management courses
    'business': [
      {
        title: 'Google Project Management Certificate',
        url: 'https://www.coursera.org/professional-certificates/google-project-management',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/4d/c78d40b41511e8baf207b74ef5a0b0/PM-Logo-Square.png',
        author: 'Google',
        description: 'Launch your career in project management with professional training.',
        duration: '6 months',
        source: 'coursera'
      },
      {
        title: 'Business Strategy Specialization',
        url: 'https://www.coursera.org/specializations/business-strategy',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/16/d602b00a6b11e88d594f951694ab88/Python-thumbnail.png',
        author: 'University of Virginia',
        description: 'Learn how to develop and execute successful business strategies.',
        duration: '5 months',
        source: 'coursera'
      },
      {
        title: 'Digital Marketing Specialization',
        url: 'https://www.coursera.org/specializations/digital-marketing',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/bd/c21e401d8f4b9699a7504ea5bce7c0/React-logo-1.png',
        author: 'University of Illinois',
        description: 'Master digital marketing strategy, social media, SEO, and analytics.',
        duration: '8 months',
        source: 'coursera'
      }
    ],
    // Design and UI/UX courses 
    'design': [
      {
        title: 'Google UX Design Professional Certificate',
        url: 'https://www.coursera.org/professional-certificates/google-ux-design',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/4b/02f844e0e111e8b5e787a1c53e3782/UX_Design.png',
        author: 'Google',
        description: 'Launch your career in UX design with professional-level skills.',
        duration: '6 months',
        source: 'coursera'
      },
      {
        title: 'UI / UX Design Specialization',
        url: 'https://www.coursera.org/specializations/ui-ux-design',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/69/354af0135b11e88d594f951694ab88/Course2_HTML-CSS-JavaScript.png',
        author: 'California Institute of the Arts',
        description: 'Design effective user interfaces and experiences for digital products.',
        duration: '5 months',
        source: 'coursera'
      },
      {
        title: 'Graphic Design Specialization',
        url: 'https://www.coursera.org/specializations/graphic-design',
        thumbnail: 'https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://s3.amazonaws.com/coursera-course-photos/f4/a05a80e57511e8af98e5c0374f78cf/Course1x1.jpg',
        author: 'California Institute of the Arts',
        description: 'Learn essential graphic design skills and principles.',
        duration: '6 months',
        source: 'coursera'
      }
    ]
  };
  
  // Default category if no match is found
  let bestMatchCategory = 'programming';
  
  // Try to determine the best category based on the query
  const programmingKeywords = ['code', 'programming', 'development', 'software', 'web', 'javascript', 'python', 'java', 'html', 'css', 'node', 'react', 'angular', 'vue', 'frontend', 'backend'];
  const dataKeywords = ['data', 'analytics', 'statistics', 'r', 'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi', 'excel', 'sql', 'database'];
  const aiKeywords = ['ai', 'machine learning', 'ml', 'deep learning', 'artificial intelligence', 'neural', 'nlp', 'computer vision', 'tensorflow', 'pytorch'];
  const businessKeywords = ['business', 'management', 'project', 'finance', 'marketing', 'leadership', 'strategy', 'entrepreneurship', 'startup', 'agile', 'scrum'];
  const designKeywords = ['design', 'ui', 'ux', 'user interface', 'user experience', 'graphic', 'web design', 'photoshop', 'illustrator', 'figma', 'sketch'];
  
  // Check for keyword matches to determine category
  if (dataKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    bestMatchCategory = 'data';
  } else if (aiKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    bestMatchCategory = 'ai';
  } else if (businessKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    bestMatchCategory = 'business';
  } else if (designKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    bestMatchCategory = 'design';
  } else if (programmingKeywords.some(keyword => normalizedQuery.includes(keyword))) {
    bestMatchCategory = 'programming';
  }
  
  // Get courses from the best matching category
  const recommendedCourses = popularCoursesByCategory[bestMatchCategory].map(course => ({
    ...course,
    // Add a note that this is recommended for the specific skill
    description: `${course.description} Great for learning ${query}.`
  }));
  
  return recommendedCourses;
};

/**
 * Check if Coursera API is configured
 * @returns {boolean} - Whether the Coursera API key is configured
 */
const isCourseraApiConfigured = () => {
  return !!COURSERA_API_KEY && COURSERA_API_KEY.length > 10;
};

/**
 * Detects the domain category of a skill query
 * @param {string} query - The normalized query string
 * @returns {string|null} - The detected domain category or null if not found
 */
const detectDomainCategory = (query) => {
  const domains = {
    'programming': ['javascript', 'python', 'java', 'programming', 'coding', 'software', 'developer', 'typescript', 'c++', 'c#', 'php', 'ruby', 'swift', 'kotlin', 'rust', 'go', 'golang'],
    'web_development': ['html', 'css', 'web', 'frontend', 'backend', 'full-stack', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask'],
    'data_science': ['data', 'analytics', 'statistics', 'r', 'pandas', 'numpy', 'matplotlib', 'tableau', 'power bi', 'excel', 'sql', 'database'],
    'machine_learning': ['machine learning', 'ai', 'artificial intelligence', 'deep learning', 'neural networks', 'nlp', 'computer vision', 'tensorflow', 'pytorch', 'keras'],
    'devops': ['devops', 'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'ci/cd', 'jenkins', 'terraform', 'infrastructure'],
    'mobile': ['android', 'ios', 'flutter', 'react native', 'swift', 'kotlin', 'mobile', 'app development'],
    'design': ['ui', 'ux', 'design', 'figma', 'sketch', 'adobe', 'photoshop', 'illustrator', 'graphic', 'interface'],
    'business': ['project management', 'agile', 'scrum', 'product', 'management', 'mba', 'finance', 'marketing', 'leadership']
  };
  
  for (const [domain, keywords] of Object.entries(domains)) {
    if (keywords.some(keyword => query.includes(keyword))) {
      return domain;
    }
  }
  
  return null;
};

/**
 * Filter courses by relevance to the search query
 * @param {Array} courses - The courses to filter
 * @param {string} query - The expanded search query
 * @param {string} originalQuery - The original search query
 * @param {string|null} domain - The detected domain category
 * @returns {Array} - Filtered and sorted courses by relevance
 */
const filterCoursesByRelevance = (courses, query, originalQuery, domain) => {
  if (!courses || courses.length === 0) {
    return [];
  }

  // Extract keywords from queries for matching
  const queryKeywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  const originalKeywords = originalQuery.toLowerCase().split(/\s+/).filter(k => k.length > 2);
  
  // Calculate relevance scores for each course
  return courses.map(course => {
    const title = (course.name || '').toLowerCase();
    const description = (course.description || '').toLowerCase();
    
    // Calculate initial relevance score
    let relevanceScore = 0;
    
    // Title exact match with original query (highest value)
    if (title === originalQuery) {
      relevanceScore += 100;
    }
    
    // Title contains original query as whole phrase
    if (title.includes(originalQuery)) {
      relevanceScore += 50;
    }
    
    // Title contains expanded query terms
    queryKeywords.forEach(keyword => {
      if (title.includes(keyword)) {
        relevanceScore += 10;
      }
    });
    
    // Original query keywords in title (higher relevance than expanded terms)
    originalKeywords.forEach(keyword => {
      if (title.includes(keyword)) {
        relevanceScore += 15;
      }
    });
    
    // Description relevance (lower weight than title)
    if (description.includes(originalQuery)) {
      relevanceScore += 25;
    }
    
    queryKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        relevanceScore += 5;
      }
    });
    
    originalKeywords.forEach(keyword => {
      if (description.includes(keyword)) {
        relevanceScore += 8;
      }
    });
    
    // Domain-specific relevance boost
    if (domain) {
      const domainKeywords = {
        'programming': ['code', 'programming', 'development', 'software'],
        'web_development': ['web', 'frontend', 'backend', 'full-stack'],
        'data_science': ['data', 'analytics', 'statistics', 'analysis'],
        'machine_learning': ['machine learning', 'ai', 'artificial intelligence'],
        'devops': ['devops', 'cloud', 'infrastructure', 'deployment'],
        'mobile': ['mobile', 'app', 'android', 'ios'],
        'design': ['design', 'ui', 'ux', 'interface'],
        'business': ['business', 'management', 'leadership', 'strategy']
      };
      
      const domainTerms = domainKeywords[domain] || [];
      domainTerms.forEach(term => {
        if (title.includes(term) || description.includes(term)) {
          relevanceScore += 10;
        }
      });
    }
    
    // Boost for beginner content if query suggests beginner level
    if (originalQuery.includes('beginner') || originalQuery.includes('introduction') || originalQuery.includes('basic')) {
      if (title.includes('beginner') || title.includes('introduction') || title.includes('basic') ||
          description.includes('beginner') || description.includes('introduction')) {
        relevanceScore += 20;
      }
    }
    
    // Quality factors
    const hasGoodDescription = description && description.length > 50;
    const hasGoodTitle = title && title.length > 10 && title.length < 100;
    
    if (hasGoodDescription) relevanceScore += 10;
    if (hasGoodTitle) relevanceScore += 10;
    
    // Return course with relevance score
    return {
      ...course,
      relevanceScore: relevanceScore,
      qualityScore: relevanceScore // Initialize quality score with relevance for now
    };
  }).filter(course => {
    // Filter out courses with very low relevance
    return course.relevanceScore > 15 && course.slug; // Must have a slug for the URL
  }).sort((a, b) => {
    // Sort by relevance score descending
    return b.relevanceScore - a.relevanceScore;
  });
};

module.exports = {
  getCoursesForSkill,
  searchCoursera,
  isCourseraApiConfigured
};