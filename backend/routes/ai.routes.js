
// // backend/routes/ai.routes.js (UPDATED FINAL VERSION)

// const express = require('express');
// const { generateResponse } = require('../controllers/ai.controller.js');
// const chatController = require('../controllers/chat.controller'); 
// const permissiveAuth = require('../middleware/permissiveAuth'); // <-- RENAMED 
// const requireAuth = require('../middleware/requireAuth');       // <-- NEW STRICT MIDDLEWARE
// const router = express.Router();

// // ------------------------------------------------------------------
// // 1. CHAT/AI ROUTE (Permissive)
// // ------------------------------------------------------------------
// router.post('/chat', permissiveAuth, generateResponse);


// // ------------------------------------------------------------------
// // 2. CONVERSATION HISTORY ROUTES (STRICTLY Protected)
// // ------------------------------------------------------------------

// // NEW CRITICAL ROUTE: GET /api/ai/conversations - List all chats
// router.get('/conversations', requireAuth, chatController.getAllConversations); 

// // Route to fetch a single conversation's messages
// router.get('/conversations/:conversationId', requireAuth, chatController.getConversationHistory); 

// module.exports = router;

// backend/routes/ai.routes.js 

const express = require('express');
const { generateResponse } = require('../controllers/ai.controller.js');

// --- CRITICAL FIX: Destructure ALL required functions directly ---
const { 
    getAllConversations, 
    getConversationHistory, 
    deleteConversation 
} = require('../controllers/chat.controller'); 

const requireAuth = require('../middleware/requireAuth');       
const router = express.Router();


// ------------------------------------------------------------------
// 1. CHAT/AI ROUTE (Uses Permissive Auth)
// ------------------------------------------------------------------
router.post('/chat', requireAuth, generateResponse);


// ------------------------------------------------------------------
// 2. CONVERSATION HISTORY ROUTES (Strictly Protected)
// ------------------------------------------------------------------

// GET /api/ai/conversations - List all chats
router.get('/conversations', requireAuth, getAllConversations); 

// GET /api/ai/conversations/:conversationId - Fetch a single chat's messages
router.get('/conversations/:conversationId', requireAuth, getConversationHistory); 

// DELETE /api/ai/conversations/:conversationId - DELETE ROUTE FIX
router.delete('/conversations/:conversationId', requireAuth, deleteConversation); 
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ (This is the crashing line, now fixed by proper import)

module.exports = router;