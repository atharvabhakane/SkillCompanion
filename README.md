# Skill Enhancement Companion

A platform to help users identify skill gaps for their target roles, analyze trending skills and tools in the market, and contribute to a community-driven skills database.

## Project Structure

- `backend/` - Node.js Express backend server
- `frontend/` - React frontend application

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Firebase account
- Google Sheets API key
- Gemini API key

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
SKILL_SHEET_ID=your_skill_spreadsheet_id
TOOL_SHEET_ID=your_tool_spreadsheet_id
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

## Features

- User authentication with Firebase
- Skills gap analysis
- Trending skills and tools analysis
- Community-driven data collection
- Personalized skill enhancement recommendations

## API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/google-login` - Login with Google

### Health Check
- `GET /api/health` - Check server status 
