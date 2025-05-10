import axios from 'axios';

// Configure axios for API requests
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Fetch learning resources for a specific skill
 * @param {string} skillName - The name of the skill to fetch resources for
 * @returns {Promise<Object>} - Object containing success status, data, and groupedData
 */
export const fetchLearningResourcesForSkill = async (skillName) => {
  try {
    if (!skillName) {
      throw new Error('Skill name is required');
    }
    
    const response = await api.get(`/learning/skill/${encodeURIComponent(skillName)}`);
    
    // Check if response contains data
    if (response.data && (response.data.success || response.data.status === 'success')) {
      let resourcesData;
      
      // Extract data based on common response formats
      if (response.data.data) {
        resourcesData = response.data.data;
      } else if (response.data.resources) {
        resourcesData = response.data.resources;
      } else {
        // Try to find data in other common fields
        const possibleDataFields = ['data', 'resources', 'results', 'items'];
        for (const field of possibleDataFields) {
          if (response.data[field]) {
            resourcesData = response.data[field];
            break;
          }
        }
      }
      
      // If no data was found, use empty array
      if (!resourcesData) {
        resourcesData = [];
      }
      
      // Format the response in a consistent way
      return {
        success: true,
        data: resourcesData,
        groupedData: response.data.groupedData || null
      };
    } else {
      console.error('Unsuccessful response from API:', response.data);
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch learning resources',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching learning resources:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching learning resources',
      data: []
    };
  }
};

/**
 * Fetch learning resources for a specific role
 * @param {string} roleName - The name of the role to fetch resources for
 * @returns {Promise<Object>} - Object containing success status and data
 */
export const fetchLearningResourcesForRole = async (roleName) => {
  try {
    if (!roleName) {
      throw new Error('Role name is required');
    }
    
    const response = await api.get(`/learning/role/${encodeURIComponent(roleName)}`);
    
    if (response.data && (response.data.success || response.data.status === 'success')) {
      let resourcesData;
      
      if (response.data.data) {
        resourcesData = response.data.data;
      } else if (response.data.resources) {
        resourcesData = response.data.resources;
      } else {
        const possibleDataFields = ['data', 'resources', 'results', 'items'];
        for (const field of possibleDataFields) {
          if (response.data[field]) {
            resourcesData = response.data[field];
            break;
          }
        }
      }
      
      return {
        success: true,
        data: resourcesData || []
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to fetch role resources',
        data: []
      };
    }
  } catch (error) {
    console.error('Error fetching role resources:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while fetching role resources',
      data: []
    };
  }
};

/**
 * Search for learning resources
 * @param {string} query - The search query
 * @returns {Promise<Object>} - Object containing success status and data
 */
export const searchLearningResources = async (query) => {
  try {
    if (!query) {
      throw new Error('Search query is required');
    }
    
    const response = await api.get(`/learning/search?q=${encodeURIComponent(query)}`);
    
    if (response.data && (response.data.success || response.data.status === 'success')) {
      let resourcesData;
      
      if (response.data.data) {
        resourcesData = response.data.data;
      } else if (response.data.resources) {
        resourcesData = response.data.resources;
      } else {
        const possibleDataFields = ['data', 'resources', 'results', 'items'];
        for (const field of possibleDataFields) {
          if (response.data[field]) {
            resourcesData = response.data[field];
            break;
          }
        }
      }
      
      return {
        success: true,
        data: resourcesData || []
      };
    } else {
      return {
        success: false,
        message: response.data?.message || 'Failed to search learning resources',
        data: []
      };
    }
  } catch (error) {
    console.error('Error searching learning resources:', error);
    return {
      success: false,
      message: error.message || 'An error occurred while searching learning resources',
      data: []
    };
  }
};

export default api; 