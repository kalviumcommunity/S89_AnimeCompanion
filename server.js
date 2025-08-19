const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const rateLimit = require("express-rate-limit");
const cors = require('cors');
const mongoose = require('mongoose');

// Import the ChatSession model from the schema file
const ChatSession = require('./schema'); 

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// --- MongoDB Configuration ---
const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB! 🚀"))
    .catch(err => {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    });

// --- API Security & Middleware ---
app.use(express.json());
app.use(express.static('public'));
app.use(cors());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests from this IP, please try again after 15 minutes."
});
app.use(limiter);

// --- Gemini API & System Prompt ---
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Define the generation configuration here
const generationConfig = {
    topK: 40         // Adjusts Top K sampling. The model considers only the top 40 most likely tokens.
};

// Initialize the Gemini model with your API key and the new generation configuration
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: generationConfig 
});

const systemPrompt = "You are Anime Companion, an AI assistant built for anime fans. Your purpose is to help users with episode summaries, anime recommendations, character information, and trivia. Your tone is friendly, knowledgeable, and a bit playful, like a fellow anime enthusiast. Always prioritize providing accurate information and, where possible, use emojis to enhance the fan experience.";

// A simple API endpoint for the chatbot
app.post('/chat', async (req, res) => {
    try {
        const { sessionId = 'default-session', prompt: userPrompt } = req.body;
        
        if (!userPrompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }

        let chatSession = await ChatSession.findOne({ sessionId: sessionId });
        let chat;
        let history = [];

        if (!chatSession) {
            // First time this user has messaged. Create a new session.
            history = [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Hello! I am your Anime Companion. How can I help you today?" }] }
            ];
            chatSession = new ChatSession({
                sessionId: sessionId,
                history: history,
                createdAt: new Date()
            });
            await chatSession.save();
        } else {
            // User exists, so use their history.
            history = chatSession.history;
        }

        // Add the user's new prompt to the history for token counting
        const currentHistory = [...history, { role: "user", parts: [{ text: userPrompt }] }];

        // Count the total tokens in the request
        const { totalTokens } = await model.countTokens({ contents: currentHistory });
        console.log(`Tokens used for this API call: ${totalTokens}`);

        // Start chat with the retrieved history
        chat = model.startChat({ history: history });
        const result = await chat.sendMessage(userPrompt);
        const responseText = result.response.text();

        // Update the history with the new messages
        chatSession.history.push(
            { role: "user", parts: [{ text: userPrompt }] },
            { role: "model", parts: [{ text: responseText }] }
        );
        chatSession.updatedAt = new Date();
        await chatSession.save();

        res.json({ message: responseText, sessionId: sessionId });

    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Failed to process chat message.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log("Your Anime Companion backend is ready! 🤖");
});