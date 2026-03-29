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

    const tempFilePath = path.join(process.cwd(), "speech.wav");
    // Write buffer to disk to ensure flawless stream formatting for ffmpeg on API side
    fs.writeFileSync(tempFilePath, file.buffer);

    // Determine model and key based on lang
    const lang = req.body.lang || "ru";
    const model = lang === "kk" ? "speech-to-text-kk" : "speech-to-text";
    const apiKey = lang === "kk" ? process.env.ALEM_STT_KK_API_KEY : process.env.ALEM_STT_API_KEY;

    const formData = new FormData();
    formData.append("model", model);
    formData.append("file", fs.readFileSync(tempFilePath), {
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

    // Cleanup temp file
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

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

  const apiKey = process.env.ALEM_AI_KEY;
  if (!apiKey) {
    console.error("❌ ALEM_AI_KEY is missing in environment variables!");
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
      "timeEstimate": "...",
      "children": ["step1"],
      "resources": [{"title": "...", "type": "youtube", "url": "..."}]
    }
  ]
}

Output explicitly ONLY valid JSON. No markdown wrappers.`;

  try {
    console.log("📡 Contacting alem.ai with gemma3...");
    const response = await axios.post("https://llm.alem.ai/v1/chat/completions", {
      model: "gemma3", 
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      timeout: 60000 // 60s timeout for large generation
    });

    let roadmapText = response.data.choices[0].message.content.trim();
    console.log("✅ Received response from LLM (length:", roadmapText.length, ")");

    // Robust JSON cleaning
    try {
      // Remove markdown wrappers
      if (roadmapText.includes('```')) {
        roadmapText = roadmapText.replace(/```(?:json)?\s*/g, '').replace(/\s*```/g, '');
      }
      
      // Attempt to find the first '{' and last '}' to strip any prepended/appended text
      const startIdx = roadmapText.indexOf('{');
      const endIdx = roadmapText.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1) {
        roadmapText = roadmapText.substring(startIdx, endIdx + 1);
      }

      const roadmapJson = JSON.parse(roadmapText);
      res.json(roadmapJson);
      console.log("✨ Roadmap successfully generated and sent to client.");

    } catch (parseError) {
      console.error("❌ JSON Parse Failed!");
      console.error("DEBUG: Raw result was:", roadmapText);
      throw new Error(`Failed to parse AI response into JSON: ${parseError.message}`);
    }

  } catch (error) {
    console.error("❌ Roadmap Generation Error:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", JSON.stringify(error.response.data, null, 2));
      res.status(500).json({ 
        error: "Alem AI API Error", 
        details: error.response.data.error?.message || "LLM Provider Error" 
      });
    } else {
      console.error("Message:", error.message);
      res.status(500).json({ error: "Generation Failed", details: error.message });
    }
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
