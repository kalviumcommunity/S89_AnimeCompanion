// backend/routes/ai.routes.js
const express = require('express');
const { generateResponse } = require('../controllers/ai.controller.js'); // <-- REVISED PATH
const router = express.Router();

// POST /api/ai/chat - Main endpoint for sending user queries
router.post('/chat', generateResponse);

module.exports = router;