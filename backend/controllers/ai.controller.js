// backend/controllers/ai.controller.js
const {
  ai,
  systemInstruction,
  model,
  tuning
} = require('../config/gemini.config.js'); // <-- REVISED PATH

/**
 * Handles the main chat interaction with the Gemini LLM.
 */
exports.generateResponse = async (req, res) => {
  const { userPrompt, conversationHistory = [] } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ error: 'User prompt is required.' });
  }

  try {
    // 1. Prepare Conversation History for the Model
    const history = conversationHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Add the current user prompt to the history
    const contents = [...history, { role: 'user', parts: [{ text: userPrompt }] }];

    // 2. Call the Gemini Model
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: tuning.temperature,
        maxOutputTokens: tuning.maxOutputTokens,
      }
    });

    const aiResponseText = response.text;

    // 3. Send the AI's response back to the frontend
    res.json({
      text: aiResponseText,
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: 'Failed to generate response from AI.',
      details: error.message
    });
  }
};