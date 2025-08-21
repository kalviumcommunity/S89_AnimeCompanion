const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const mongoose = require('mongoose');
const ChatSession = require('./schema');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// --- Middleware ---
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

// --- System Prompt ---
const systemPrompt = `
You are Anime Companion, an AI assistant built for anime fans.
Your purpose is to help users with episode summaries, anime recommendations, character information, and trivia.
Tone: friendly, playful, knowledgeable. Use emojis where appropriate.
Your response must always be strict JSON with keys: "answer", "topic", "emojis".
`;

// --- Gemini Config ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: systemPrompt,
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    responseMimeType: "application/json"
  }
});

// --- Chat Route ---
app.post('/chat', async (req, res) => {
  try {
    const { sessionId = 'default-session', prompt: userPrompt } = req.body;
    if (!userPrompt) return res.status(400).json({ error: 'Prompt is required.' });

    // Initial greeting shortcut
    if (userPrompt === 'initial-greeting') {
      return res.json({
        sessionId,
        response: {
          answer: "Hey there! 👋 I’m your Anime Companion. Ask me anything about anime — episodes, characters, recommendations, or trivia! 🍿✨",
          topic: "greeting",
          emojis: ["👋", "🍿", "✨"]
        }
      });
    }

    // Load or create chat session
    let chatSession = await ChatSession.findOne({ sessionId });
    if (!chatSession) {
      chatSession = new ChatSession({
        sessionId,
        history: [],
        createdAt: new Date()
      });
    }

    // --- Format history for Gemini API ---
    const chatHistory = chatSession.history.map(msg => ({
      role: msg.role,
      parts: msg.parts.map(part => part.text ? { text: part.text } : { text: JSON.stringify(part.json) })
    }));

    // Start stateful chat
    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(userPrompt);

    // --- Parse AI response safely ---
    let structuredResponse;
    try {
      // Parse text manually for consistency
      structuredResponse = JSON.parse(result.response.text());
    } catch (err) {
      console.warn("❌ Failed to parse AI JSON. Full response:", result.response.text());
      structuredResponse = {
        answer: "I had a bit of a hiccup. Can you try rephrasing that? 😅",
        topic: "general",
        emojis: ["😅"]
      };
    }

    // --- Save conversation to DB ---
    chatSession.history.push({ role: "user", parts: [{ text: userPrompt }] });
    chatSession.history.push({ role: "model", parts: [{ json: structuredResponse }] });
    chatSession.updatedAt = new Date();
    await chatSession.save();

    res.json({ sessionId, response: structuredResponse, history: chatSession.history });

  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Failed to process chat message." });
  }
});

// --- Start Server ---
app.listen(port, () => console.log(`🚀 Server running at http://localhost:${port}`));
