// backend/routes/ai.routes.js (FINAL VERSION)

const express = require('express');
const { generateResponse } = require('../controllers/ai.controller.js');
const { getConversationHistory } = require('../controllers/chat.controller'); // <--- NEW CONTROLLER IMPORT
const authMiddleware = require('../middleware/authMiddleware'); 
const router = express.Router();

// POST /api/ai/chat - Main endpoint for sending user queries (Creation/Update)
router.post('/chat', authMiddleware, generateResponse);

// GET /api/ai/history/:conversationId - NEW ENDPOINT to retrieve saved messages
// It uses authMiddleware to verify the user and get req.userId
router.get('/history/:conversationId', authMiddleware, getConversationHistory); // <--- ADDED ROUTE

module.exports = router;