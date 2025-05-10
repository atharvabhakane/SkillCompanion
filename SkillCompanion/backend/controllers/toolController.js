const sheetsService = require('../services/sheetsService');

// Get all tools
exports.getAllTools = async (req, res) => {
  try {
    const tools = await sheetsService.getToolsData();
    
    res.status(200).json({
      status: 'success',
      results: tools.length,
      data: {
        tools
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tools data',
      error: error.message
    });
  }
};

// Get tools by category
exports.getToolsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const tools = await sheetsService.getToolsData();
    
    const filteredTools = tools.filter(
      tool => tool.category.toLowerCase() === category.toLowerCase()
    );
    
    res.status(200).json({
      status: 'success',
      results: filteredTools.length,
      data: {
        tools: filteredTools
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch tools by category',
      error: error.message
    });
  }
}; 