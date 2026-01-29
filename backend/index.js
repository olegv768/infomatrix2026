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

    const prompt = `Create a comprehensive and detailed roadmap for achieving the goal: ${goal}

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
      "children": ["step1", "step2"],
      "resources": [
        {
          "title": "Resource name",
          "type": "youtube|documentation|course|article|book",
          "url": "https://actual-real-url.com"
        }
      ]
    }
  ]
}

Rules:
- id: only latin letters and numbers, no spaces
- label: 2-5 words, short descriptive name (in user's language)
- level: 0 (main goal), 1 (major phases), 2 (key milestones), 3 (specific tasks), 4 (micro-steps)
- description: detailed, practical description of what to do and why (in user's language)
- category: one of "basics", "practice", "advanced", "goal", "foundation", "intermediate"
- timeEstimate: realistic time estimate (e.g., "1-2 weeks", "1 month", "2-3 months")
- children: array of child node ids (each node should have 2-5 children for proper depth)
- resources: REQUIRED! Array of 2-4 HIGH-QUALITY learning resources for this specific node
  * Use REAL, EXISTING URLs that are currently available online
  * Prefer: official documentation, popular YouTube channels, Coursera, Udemy, freeCodeCamp, MDN, W3Schools
  * Types: "youtube" (video tutorials), "documentation" (official docs), "course" (online courses), "article" (blog posts/guides), "book" (online books)
  * Each resource must be directly relevant to the specific node topic
  * Mix different types of resources for learning variety

Create 30-50 nodes with comprehensive logical structure:
- 1 node at level 0 (main goal)
- 4-6 nodes at level 1 (major phases/stages of learning)
- 12-18 nodes at level 2 (key milestones and major topics)
- 12-20 nodes at level 3 (specific tasks, subtopics, and skills)
- 2-10 nodes at level 4 (optional micro-steps for complex topics)

Ensure the roadmap covers:
- Foundational knowledge first
- Progressive skill building
- Practical projects and exercises
- Advanced topics and specializations
- Each node should logically build on previous ones

RESOURCE QUALITY GUIDELINES:
- For YouTube: link to well-known educational channels (Traversy Media, freeCodeCamp, The Net Ninja, etc.)
- For Documentation: use official sources (React.dev, developer.mozilla.org, python.org/docs, etc.)
- For Courses: suggest popular platforms (Coursera, Udemy, EdX, Codecademy, freeCodeCamp)
- Ensure all URLs are realistic and follow proper URL format

Make the roadmap practical, actionable, and comprehensive enough to truly master the skill.
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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
