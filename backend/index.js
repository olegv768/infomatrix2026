import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";

dotenv.config();

// Initialize the API with the standard library
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://levelupmap.xyz",
      /\.vercel\.app$/,   // любые превью-деплои на Vercel
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Roadmap API Server is running!");
});

// Email Transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post("/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'levelupmap121@gmail.com',
    subject: `New Contact Form Submission: ${subject}`,
    text: `You have a new message from ${name} (${email}):\n\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #6366f1;">New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 10px;">
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ error: "Failed to send email", details: error.message });
  }
});

app.post("/roadmap", async (req, res) => {
  const { goal } = req.body;
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  let roadmapText = "";

  try {
    const prompt = `Create a comprehensive and detailed roadmap for achieving the goal: ${goal}

CRITICAL INSTRUCTION: You MUST respond in the SAME LANGUAGE as the user's goal above. If the goal is in Russian, respond in Russian. If in English, respond in English. Match the user's language exactly.

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
- resources: MANDATORY array of 2-4 learning resources (see RESOURCE RULES below)

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
- STRICT RULE: Child nodes MUST be exactly one level deeper than their parent (e.g., Level 2 parent -> Level 3 children). Do NOT skip levels (e.g., Level 2 -> Level 4 is FORBIDDEN).

════════════════════════════════════════
RESOURCE RULES — FOLLOW EXACTLY:
════════════════════════════════════════

RULE 1 — MINIMUM 2 RESOURCES PER NODE (NON-NEGOTIABLE):
Every node MUST have at least 2 resources. If you cannot find 2 topic-specific resources,
use these guaranteed fallback URLs (replace TOPIC with the actual topic slug):
  { "title": "freeCodeCamp — Search (English)", "type": "course", "url": "https://www.freecodecamp.org/news/search/?query=TOPIC" }
  { "title": "YouTube — Search (English)", "type": "youtube", "url": "https://www.youtube.com/results?search_query=TOPIC" }
  { "title": "Coursera — Search (English)", "type": "course", "url": "https://www.coursera.org/search?query=TOPIC" }
NEVER leave a node with 0 or 1 resource.

RULE 2 — ONLY REAL, VERIFIABLE URLS (NO FABRICATION):
Do NOT invent article titles or fake blog posts. Only use URLs from known platforms:
  YouTube: youtube.com/@traversymedia, youtube.com/@freecodecamp, youtube.com/results?search_query=...
  Docs: developer.mozilla.org, docs.python.org, react.dev, learn.microsoft.com, docs.oracle.com
  Courses: freecodecamp.org, theodinproject.com, cs50.harvard.edu, coursera.org, udemy.com
  Articles: css-tricks.com, smashingmagazine.com, dev.to, medium.com, geeksforgeeks.org

RULE 3 — LANGUAGE LABELS ON RESOURCE TITLES:
If the resource is in the SAME language as the user's goal → write title normally.
If the resource is in a DIFFERENT language → append the language name in parentheses.
Examples: "The Odin Project (English)", "MDN Web Docs (English)", "freeCodeCamp (English)"
Do NOT translate titles — keep them original. ALWAYS prefer resources in the user's language first;
only fall back to English if no native-language resource exists.

RULE 4 — NO FABRICATED TASKS:
Every node must represent a real, widely-recognized learning step.
Do NOT invent obscure sub-skills or fictional milestones that have no real-world basis.`;

    // Use Gemini 3 Flash Preview with JSON mode
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    // Implement retry logic for rate limits
    let result;
    let maxRetries = 2;
    let retryCount = 0;
    let baseDelay = 3000;

    while (retryCount <= maxRetries) {
      try {
        result = await model.generateContent(prompt);
        break;
      } catch (error) {
        const isRateLimit = error.status === 429 || (error.message && error.message.includes("429"));
        if (isRateLimit && retryCount < maxRetries) {
          retryCount++;
          console.log(`Rate limit reached, retrying in ${baseDelay / 1000}s... (Attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, baseDelay));
          baseDelay *= 2; // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    const response = await result.response;
    roadmapText = response.text();

    if (!roadmapText) {
      return res.status(500).json({ error: "Failed to generate roadmap" });
    }

    const roadmapJson = JSON.parse(roadmapText);
    res.json(roadmapJson);
  } catch (error) {
    console.error("Error generating roadmap:", error);

    const isRateLimit = error.status === 429 || (error.message && error.message.includes("429"));

    if (isRateLimit) {
      return res.status(429).json({
        error: "AI Service is busy. Please try again in 30 seconds.",
        details: "The AI service is currently experiencing high demand. We've attempted retries, but the limit persists. Please wait a moment before trying again."
      });
    }

    if (error instanceof SyntaxError) {
      console.error("Raw Invalid JSON:", roadmapText);
      return res.status(500).json({
        error: "Invalid Roadmap Format",
        details: "The AI generated an invalid roadmap structure. Please try a more specific goal."
      });
    }

    res
      .status(500)
      .json({ error: "Generation Failed", details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
