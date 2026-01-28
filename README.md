# RoadmapAI - AI-Powered Learning Paths

An interactive AI roadmap generator that creates personalized learning paths using Google Gemini AI.

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
├── vercel.json           # Vercel deployment configuration
└── README.md
```

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file with your Google Gemini API key:

```
API_KEY=your_google_gemini_api_key
```

Start the server:

```bash
npm start
```

The API will be available at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Pages

- **Home** - Landing page with features and testimonials
- **Generator** - AI roadmap generator with interactive visualization
- **About Us** - Team and company information
- **Contact** - Contact form and FAQ

## Deployment (Vercel)

This project is configured for a monorepo deployment on Vercel.

1. Connect your repository to Vercel.
2. Add the `API_KEY` for Gemini in the Environment Variables.
3. Vercel will use `vercel.json` to route requests.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS (v4), D3.js, Font Awesome
- **Backend**: Express.js, Google Gemini AI
- **Visualization**: D3.js force-directed graph

## License

MIT License - feel free to use this project for your own purposes.