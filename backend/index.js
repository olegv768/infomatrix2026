import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:3000",
      "https://levelupmap.xyz",
      /\.vercel\.app$/,
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

app.get("/", (req, res) => {
  res.send("Roadmap AI Server is running with Gemini 3 Flash!");
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
  console.log(`🚀 New Roadmap Request: ${goal}`);
  
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("❌ API_KEY is missing in environment variables!");
    return res.status(500).json({ error: "Server Configuration Error", details: "API Key is not configured on the server." });
  }

  const prompt = `Create a comprehensive and detailed roadmap for achieving the goal: ${goal}

CRITICAL INSTRUCTION: You MUST respond in the SAME LANGUAGE as the user's goal above. Match the user's language exactly.

JSON Format:
{
  "title": "Roadmap Title",
  "nodes": [
    {
      "id": "main",
      "label": "Main Goal",
      "level": 0,
      "description": "...",
      "category": "goal",
      "timeEstimate": "1-2 weeks",
      "children": ["step1"],
      "resources": [{"title": "...", "type": "youtube", "url": "..."}]
    }
  ]
}

- timeEstimate: strictly ONLY time with numbers and units (e.g., "2-3 hours", "1-2 days", "2-3 weeks", "1-2 months"). NEVER use "Ongoing", "N/A" or extra explanations.
- children: array of child node ids (each node should have 2-5 children for proper depth)
- resources: MANDATORY array of 2-4 learning resources (see RESOURCE RULES below)

Create 30-50 nodes with comprehensive logical structure:
- 1 node at level 0 (main Goal)
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
- STRICT RULE: Child nodes MUST be exactly one level deeper than their parent (e.g., Level 2 parent -> Level 3 children). Do NOT skip levels.

════════════════════════════════════════
STRICT RESTRICTIONS — DO NOT VIOLATE:
════════════════════════════════════════
❌ Нельзя нарушать законодательство РК
❌ Нельзя проводить незаконную обработку данных
❌ Нельзя давать медицинские/юридические рекомендации
❌ Нельзя создавать азартные игры

Output explicitly ONLY valid JSON. No markdown wrappers.`;

  try {
    console.log(`📡 Contacting Gemini 3 Flash...`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    // Set up safety settings if needed (optional)
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let roadmapText = response.text().trim();
    
    console.log("✅ Received response from Gemini (length:", roadmapText.length, ")");

    // Robust JSON cleaning
    if (roadmapText.includes('```')) {
      roadmapText = roadmapText.replace(/```(?:json)?\s*/g, '').replace(/\s*```/g, '');
    }
    
    const startIdx = roadmapText.indexOf('{');
    const endIdx = roadmapText.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      roadmapText = roadmapText.substring(startIdx, endIdx + 1);
    }

    roadmapText = roadmapText.replace(/[\x00-\x1F\x7F]/g, (ch) => {
      if (ch === '\n' || ch === '\r' || ch === '\t') return ch;
      return '';
    });

    roadmapText = roadmapText.replace(/,\s*([\]}])/g, '$1');

    try {
      const roadmapJson = JSON.parse(roadmapText);
      res.json(roadmapJson);
      console.log("✨ Roadmap successfully generated and sent to client.");
    } catch (parseError) {
      console.error(`❌ JSON Parse Failed:`, parseError.message);
      console.error("DEBUG: Raw result was:", roadmapText.substring(0, 500));
      return res.status(500).json({ 
        error: "Generation Failed", 
        details: "AI returned invalid format. Please try again." 
      });
    }

  } catch (error) {
    console.error(`❌ Roadmap Generation Error:`);
    console.error("Message:", error.message);
    res.status(500).json({ error: "Generation Failed", details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
