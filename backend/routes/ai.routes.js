// // backend/routes/ai.routes.js (FINAL VERSION)

// const express = require('express');
// const { generateResponse } = require('../controllers/ai.controller.js');
// const { getConversationHistory } = require('../controllers/chat.controller'); // <--- NEW CONTROLLER IMPORT
// const authMiddleware = require('../middleware/permissiveAuth.js'); 
// const router = express.Router();

// // POST /api/ai/chat - Main endpoint for sending user queries (Creation/Update)
// router.post('/chat', authMiddleware, generateResponse);

// // GET /api/ai/history/:conversationId - NEW ENDPOINT to retrieve saved messages
// // It uses authMiddleware to verify the user and get req.userId
// router.get('/history/:conversationId', authMiddleware, getConversationHistory); // <--- ADDED ROUTE

// module.exports = router;


// backend/routes/ai.routes.js (UPDATED FINAL VERSION)

const express = require('express');
const { generateResponse } = require('../controllers/ai.controller.js');
const chatController = require('../controllers/chat.controller'); 
const permissiveAuth = require('../middleware/permissiveAuth'); // <-- RENAMED 
const requireAuth = require('../middleware/requireAuth');       // <-- NEW STRICT MIDDLEWARE
const router = express.Router();

// ------------------------------------------------------------------
// 1. CHAT/AI ROUTE (Permissive)
// ------------------------------------------------------------------
router.post('/chat', permissiveAuth, generateResponse);


// ------------------------------------------------------------------
// 2. CONVERSATION HISTORY ROUTES (STRICTLY Protected)
// ------------------------------------------------------------------

// NEW CRITICAL ROUTE: GET /api/ai/conversations - List all chats
router.get('/conversations', requireAuth, chatController.getAllConversations); 

// Route to fetch a single conversation's messages
router.get('/conversations/:conversationId', requireAuth, chatController.getConversationHistory); 

module.exports = router;