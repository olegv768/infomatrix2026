# RoadmapAI - AI-Powered Learning Paths

An interactive AI roadmap generator that creates personalized learning paths using Alem Gemma AI.

## 🚀 Live Demo
[Check out the live website here!](https://levelupmap.xyz/)


## Features

- **AI-Powered Roadmaps**: Generate detailed learning paths for any goal
- **Multi-Language Support**: Write your goals in any language - the AI responds in the same language
- **Interactive Visualization**: D3.js-powered graph visualization with drag-and-drop
- **Progress Tracking**: Mark steps as complete and track your progress
- **Modern UI**: Beautiful, responsive design with Font Awesome icons

## Project Structure

```
.
├── backend/              # Express.js API server
│   ├── index.js          # Main server file
│   ├── package.json
│   └── .env              # API keys (not in git)
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app with routing
│   │   └── index.css     # Global styles
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with your Alem Gemma API key:

```
API_KEY=your_google_gemma_api_key
```

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:5001`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (ensure VITE_API_URL is NOT set for local dev)

## Deployment

The project uses a split deployment architecture for maximum stability:

### 1. Backend (deployed on Render.com)
- **Service Type**: Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node index.js`
- **Environment Variables**: 
  - `API_KEY`: Your Alem Gemma API key.
  - `NODE_ENV`: `production`

### 2. Frontend (deployed on Vercel)
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend`
- **Environment Variables**: 
  - `VITE_API_URL`: The URL of your deployed Render backend (e.g., `https://infomatrix2026.onrender.com`)

## Tech Stack

- **AI & Services (alem.plus)**:
  - **Speech-to-Text**: High-precision voice transcription.
  - **Kazakh STT**: Native support for Kazakh speech recognition.
  - **Gemma 3**: Powered by Google's latest open-weight model via alem.ai.
- **Frontend**: React, Vite, TailwindCSS, D3.js, Font Awesome
- **Backend**: Node.js, Express.js
- **Email/Contact**: Web3Forms

## License

MIT License - feel free to use this project for your own purposes.