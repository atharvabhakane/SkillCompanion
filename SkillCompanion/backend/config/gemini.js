const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Sample function to test Gemini integration
const testGeminiIntegration = async () => {
  try {
    const prompt = "Hello, Gemini! Please provide a short greeting.";
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    return "Error connecting to Gemini API. Please check your API key.";
  }
};

module.exports = {
  model,
  testGeminiIntegration
}; 