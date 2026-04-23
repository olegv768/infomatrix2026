import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

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

app.get("/", (req, res) => {
  res.send("Roadmap API Server is running with alem.ai!");
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

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      console.error("No audio file found in the request");
      return res.status(400).json({ error: "No audio file provided" });
    }

    if (file.buffer.length < 100) {
       console.error("Audio file is too small or empty");
       return res.status(400).json({ error: "Audio recording is empty" });
    }

    // Determine model and key based on lang
    const lang = req.body.lang || "ru";
    const model = lang === "kk" ? "speech-to-text-kk" : "speech-to-text";
    const apiKey = lang === "kk" ? process.env.ALEM_STT_KK_API_KEY : process.env.ALEM_STT_API_KEY;

    const formData = new FormData();
    formData.append("model", model);
    formData.append("file", file.buffer, {
      filename: "speech.wav",
      contentType: "audio/wav",
    });
    formData.append("language", lang);

    console.log(`📡 Sending ${lang} audio buffer (${file.buffer.length} bytes) to alem.ai via axios...`);
    
    const response = await axios.post("https://llm.alem.ai/v1/audio/transcriptions", formData, {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        ...formData.getHeaders(),
      },
      timeout: 30000 
    });

    console.log("✅ Transcription success:", response.data.text);
    res.json({ text: response.data.text });
  } catch (error) {
    console.error("❌ Transcription error detail:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      res.status(500).json({ error: "Transcription failed", details: error.response.data });
    } else {
      console.error("Message:", error.message);
      res.status(500).json({ error: "Transcription failed", details: error.message });
    }
  }
});

app.post("/roadmap", async (req, res) => {
  const { goal } = req.body;
  console.log(`🚀 New Roadmap Request: ${goal}`);
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  // Content Filtering for prohibited topics
  const prohibitedPatterns = [
    {
      category: "Medicine",
      regex: /медицин|лечен|болезн|таблетк|лекарств|диагноз|терапи|симптом|аптек|\bmedicine\b|\bmedical\b|\bdoctor\b|\btreatment\b|\bdisease\b|\bcure\b|\bdrug\b|\bpharmacy\b|\bsymptom\b|\bdiagnosis\b/i,
      message: "Извините, мы не создаем дорожные карты по медицинским темам в целях безопасности. / Sorry, we do not generate roadmaps for medical topics for safety reasons."
    },
    {
      category: "Casino/Gambling",
      regex: /казино|азартн|ставк|покер|рулетк|слот|букмекер|выигрыш|\bcasino\b|\bgambling\b|\bbetting\b|\bpoker\b|\broulette\b|\bslots\b|\bwagering\b|\bjackpot\b/i,
      message: "Создание дорожных карт для азартных игр и казино запрещено. / Generating roadmaps for gambling and casinos is prohibited."
    },
    {
      category: "Legal",
      regex: /юрист|адвокат|закон|юридическ|судебн|прокурор|\blawyer\b|\blegal\b|\blaw\b|\battorney\b|\bcourt\b|\blitigation\b|\bprosecutor\b/i,
      message: "Мы не предоставляем дорожные карты по юридическим вопросам. / We do not provide roadmaps for legal matters."
    }
  ];

  for (const pattern of prohibitedPatterns) {
    if (pattern.regex.test(goal)) {
      console.warn(`🛑 Blocked prohibited request (${pattern.category}): ${goal}`);
      return res.status(403).json({ 
        error: pattern.message 
      });
    }
  }

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
RESOURCE RULES — FOLLOW EXACTLY:
════════════════════════════════════════
RULE 1 — MINIMUM 2 RESOURCES: Every node MUST have at least 2 resources. Use fallback URLs if needed.
RULE 2 — VERIFIABLE ABSOLUTE URLs: Every URL MUST start with https://. Use URLs from known platforms (youtube, docs, coursera).
RULE 3 — NO HALLUCINATED IDs: If you are not 100% sure about a specific video or course ID, use a search result URL instead (e.g., https://www.youtube.com/results?search_query=...). This prevents 404 errors.
RULE 4 — LANGUAGE LABELS: Keep titles original, append language in parentheses if different.
RULE 5 — NO FABRICATED TASKS: Follow real-world steps.

════════════════════════════════════════
STRICT RESTRICTIONS — DO NOT VIOLATE:
════════════════════════════════════════
❌ Нельзя нарушать законодательство РК
❌ Нельзя проводить незаконную обработку данных
❌ Нельзя давать медицинские/юридические рекомендации
❌ Нельзя создавать азартные игры

Output explicitly ONLY valid JSON. No markdown wrappers.`;

  try {
    const response = await fetch("https://llm.alem.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ALEM_AI_KEY}`
      },
      body: JSON.stringify({
        model: "gemma3", 
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "API request failed with status: " + response.status);
    }

    const data = await response.json();
    let roadmapText = data.choices[0].message.content.trim();

    // Strip markdown JSON wrappers if gemma3 adds them
    if (roadmapText.startsWith('```json')) {
      roadmapText = roadmapText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (roadmapText.startsWith('```')) {
      roadmapText = roadmapText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const roadmapJson = JSON.parse(roadmapText);
    res.json(roadmapJson);

  } catch (error) {
    console.error("Error generating roadmap:", error);
    res.status(500).json({ error: "Generation Failed", details: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
