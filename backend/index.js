import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

// Initialize the API with the standard library
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Roadmap API Server is running!");
});

app.post("/roadmap", async (req, res) => {
  const { goal } = req.body;
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  try {
    // Attempt to use the latest model, with a fallback
    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    } catch (e) {
      console.warn("Gemini 3 not available, falling back to Gemini 1.5 Flash");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    const prompt = `Create a detailed roadmap for achieving the goal: ${goal}

CRITICAL INSTRUCTION: You MUST respond in the SAME LANGUAGE as the user's goal above. If the goal is in Russian, respond in Russian. If in English, respond in English. Match the user's language exactly.

IMPORTANT: Return ONLY clean JSON without explanations, no text before or after the JSON.

JSON Format:
{
  "title": "Roadmap Title (in user's language)",
  "nodes": [
    {
      "id": "main",
      "label": "Main Goal",
      "level": 0,
      "description": "Detailed description of the main goal",
      "category": "goal",
      "timeEstimate": "6-12 months",
      "children": ["step1", "step2"]
    }
  ]
}

Rules:
- id: only latin letters and numbers, no spaces
- label: 2-4 words, short name (in user's language)
- level: 0 (main goal), 1 (main stages), 2-3 (detailed steps)
- description: practical description of what to do (in user's language)
- category: one of "basics", "practice", "advanced", "goal"
- timeEstimate: approximate time (optional)
- children: array of child node ids

Create 12-18 nodes with logical structure:
- 1 node at level 0 (main goal)
- 3-5 nodes at level 1 (main stages)
- remaining at levels 2-3 (detailed steps)

Make sure all quotes are properly closed and JSON is valid!`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let roadmapText = response.text();

    if (!roadmapText) {
      return res.status(500).json({ error: "Failed to generate roadmap" });
    }

    // Clean up markdown code blocks if present
    roadmapText = roadmapText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    const roadmapJson = JSON.parse(roadmapText);
    res.json(roadmapJson);
  } catch (error) {
    console.error("Error:", error);

    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      return res.status(429).json({
        error: "AI Service is busy. Please try again in 30 seconds.",
        details: "Quota limit reached for the free tier."
      });
    }

    res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
