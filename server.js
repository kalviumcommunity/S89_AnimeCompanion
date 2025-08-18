const express = require('express');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Load environment variables from .env file
dotenv.config();

const app = express();
const port = 3000;

// Enable JSON body parsing and serve static files
app.use(express.json());
app.use(express.static('public')); 

// --- System Prompt ---
const systemPrompt = "You are Anime Companion, an AI assistant built for anime fans. Your purpose is to help users with episode summaries, anime recommendations, character information, and trivia. Your tone is friendly, knowledgeable, and a bit playful, like a fellow anime enthusiast. Always prioritize providing accurate information and, where possible, use emojis to enhance the fan experience.";

// Initialize the Gemini model with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Map to store a chat session for each user (for a real app, this would be a database)
const userChats = new Map();

// A simple API endpoint for the chatbot
app.post('/chat', async (req, res) => {
    try {
        // Use a session ID to manage a persistent chat for each user
        const sessionId = req.body.sessionId || 'default-session'; 
        let chat = userChats.get(sessionId);

        // If no chat session exists for this user, start a new one with the system prompt
        if (!chat) {
            chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }]
                    },
                    {
                        role: "model",
                        parts: [{ text: "Hello! I am your Anime Companion. How can I help you today?" }]
                    }
                ]
            });
            userChats.set(sessionId, chat);
        }

        const userPrompt = req.body.prompt;
        
        if (!userPrompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }
        
        const result = await chat.sendMessage(userPrompt);
        const responseText = result.response.text();

        res.json({ message: responseText, sessionId: sessionId });

    } catch (error) {
        console.error('Error generating content:', error);
        res.status(500).json({ error: 'Failed to generate content.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log("Your Anime Companion backend is ready! 🤖");
});