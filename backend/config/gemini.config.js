// backend/config/gemini.config.js
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({});

const systemInstruction = `You are Anime Companion, a helpful, enthusiastic, and knowledgeable AI assistant for anime fans. Your purpose is to provide episode summaries, personalized recommendations, detailed character information, and fun trivia. Keep your tone engaging, knowledgeable, and true to the anime spirit.`;

module.exports = {
  ai,
  systemInstruction,
  model: 'gemini-2.5-flash',
  tuning: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
};