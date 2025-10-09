// // backend/controllers/chat.controller.js
// const Conversation = require('../models/Conversation');
// const mongoose = require('mongoose');

// // =========================================================================
// // FUNCTION TO LIST ALL CONVERSATIONS FOR A USER (GET /api/ai/conversations)
// // =========================================================================
// exports.getAllConversations = async (req, res) => {
//     // userId is attached by the requireAuth middleware
//     const userId = req.userId;
    
//     try {
//         // Convert userId to ObjectId for querying the database.
//         const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId); 
        
//         const conversations = await Conversation.find({ userId: userIdAsObjectId })
//                                                 .select('_id title updatedAt') 
//                                                 .sort({ updatedAt: -1 }); // Sort by newest first

//         res.json(conversations);

//     } catch (error) {
//         console.error('Error fetching ALL conversations:', error);
        
//         if (error.name === 'CastError') {
//              return res.status(400).json({ message: 'Invalid user ID format detected.' });
//         }
//         res.status(500).json({ message: 'Server error while retrieving conversations list.' });
//     }
// };

// // =========================================================================
// // FUNCTION TO FETCH A SINGLE CONVERSATION'S MESSAGES (GET /api/ai/conversations/:id)
// // =========================================================================
// exports.getConversationHistory = async (req, res) => {
//     const { conversationId } = req.params;
//     const userId = req.userId; 

//     // 1. Validate the conversation ID format immediately
//     if (!mongoose.Types.ObjectId.isValid(conversationId)) {
//         return res.status(400).json({ message: 'Invalid conversation ID format.' });
//     }

//     try {
//         // Convert userId to ObjectId for robust comparison
//         const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        
//         // 2. Fetch the conversation, ensuring it belongs to the authenticated user
//         const conversation = await Conversation.findOne({
//             _id: conversationId,
//             userId: userIdAsObjectId 
//         }).select('messages title'); 

//         if (!conversation) {
//             return res.status(404).json({ message: 'Conversation not found or access denied.' });
//         }

//         // 3. Return the history
//         res.json({
//             messages: conversation.messages,
//             title: conversation.title,
//             conversationId: conversationId
//         });

//     } catch (error) {
//         console.error('Error fetching specific conversation history:', error);
//         res.status(500).json({ message: 'Server error while retrieving history.' });
//     }
// };


// // =========================================================================
// // FUNCTION TO DELETE A SINGLE CONVERSATION (DELETE /api/ai/conversations/:id)
// // =========================================================================
// exports.deleteConversation = async (req, res) => {
//     const { conversationId } = req.params;
//     const userId = req.userId; 

//     if (!mongoose.Types.ObjectId.isValid(conversationId)) {
//         return res.status(400).json({ message: 'Invalid conversation ID format.' });
//     }

//     try {
//         // Find the conversation and DELETE it, ensuring the userId matches
//         const result = await Conversation.deleteOne({
//             _id: conversationId,
//             userId: userId // Security check: must belong to the user
//         });

//         if (result.deletedCount === 0) {
//             return res.status(404).json({ message: 'Conversation not found or access denied.' });
//         }

//         // Return success
//         res.status(200).json({ message: 'Conversation deleted successfully.', deletedId: conversationId });

//     } catch (error) {
//         console.error('Error deleting conversation:', error);
//         res.status(500).json({ message: 'Server error during conversation deletion.' });
//     }
// };


// // =========================================================================
// // FINAL EXPORT BLOCK
// // =========================================================================
// module.exports = {
//     getAllConversations: exports.getAllConversations,
//     getConversationHistory: exports.getConversationHistory,
//     deleteConversation: exports.deleteConversation,
// };


// backend/controllers/chat.controller.js
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');
// Assuming ai (Gemini client) is imported globally or passed via another file like services

// Placeholder for the Gemini client import (assuming it's available or imported elsewhere)
// const { ai } = require('../config/gemini.config.js'); 
// NOTE: For simplicity, we assume 'ai' is accessible. If not, you must import it.

// =========================================================================
// FUNCTION TO LIST ALL CONVERSATIONS FOR A USER (GET /api/ai/conversations)
// =========================================================================
exports.getAllConversations = async (req, res) => {
    const userId = req.userId;
    
    try {
        const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId); 
        
        const conversations = await Conversation.find({ userId: userIdAsObjectId })
                                                .select('_id title updatedAt') 
                                                .sort({ updatedAt: -1 }); 

        res.json(conversations);

    } catch (error) {
        console.error('Error fetching ALL conversations:', error);
        
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid user ID format detected.' });
        }
        res.status(500).json({ message: 'Server error while retrieving conversations list.' });
    }
};

// =========================================================================
// FUNCTION TO FETCH A SINGLE CONVERSATION'S MESSAGES (GET /api/ai/conversations/:id)
// =========================================================================
exports.getConversationHistory = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId; 

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format.' });
    }

    try {
        const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: userIdAsObjectId 
        }).select('messages title'); 

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or access denied.' });
        }

        res.json({
            messages: conversation.messages,
            title: conversation.title,
            conversationId: conversationId
        });

    } catch (error) {
        console.error('Error fetching specific conversation history:', error);
        res.status(500).json({ message: 'Server error while retrieving history.' });
    }
};

// =========================================================================
// FUNCTION TO DELETE A SINGLE CONVERSATION (DELETE /api/ai/conversations/:id)
// =========================================================================
exports.deleteConversation = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId; 

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format.' });
    }

    try {
        const result = await Conversation.deleteOne({
            _id: conversationId,
            userId: userId 
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found or access denied.' });
        }

        res.status(200).json({ message: 'Conversation deleted successfully.', deletedId: conversationId });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Server error during conversation deletion.' });
    }
};

// =========================================================================
// NEW FUNCTION: GENERATE RECOMMENDATION LIST (JSON) FOR DISPLAY PAGE
// (GET /api/ai/recommendations-page)
// =========================================================================
// NOTE: Requires 'ai' client to be accessible, which we assume is handled via imports/context
exports.generateRecommendationList = async (req, res) => {
    const userId = req.userId; 
    
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required for personalized recommendations.' });
    }

    try {
        // Step 1: Fetch the user's latest conversation history for context
        const conversation = await Conversation.findOne({ userId: userId })
                                               .sort({ updatedAt: -1 })
                                               .select('messages');

        const history = conversation?.messages
                        .slice(-10) 
                        .map(msg => `${msg.sender}: ${msg.text}`)
                        .join('\n') || 'No recent chat history available.';
        
        // This must be imported at the top of the file to work
        const { ai } = require('../config/gemini.config.js'); 

        // Step 2: Prompt the LLM for a structured JSON response
        const recommendationPrompt = `Based ONLY on this user's chat history context, analyze their preference for genres, characters, or shows (e.g., likes "rom-com" and "Demon Slayer"). Then, provide a list of exactly 5 highly relevant anime recommendations.
        
        CHAT HISTORY CONTEXT:
        ---
        ${history}
        ---`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ role: 'user', parts: [{ text: recommendationPrompt }] }],
            config: {
                systemInstruction: "You are a specialized recommendation engine. Your ONLY output must be a valid JSON array. The structure is: [{\"title\": \"Anime Title\", \"reason\": \"A brief, 20-word justification based on the user's history.\"}] Do NOT include markdown, apologies, greetings, or external text.",
                responseMimeType: 'application/json' 
            }
        });

        // Step 3: Parse and return the JSON list
        const jsonList = JSON.parse(response.text);

        res.json(jsonList);

    } catch (error) {
        console.error('Error generating JSON recommendations:', error);
        res.status(500).json({ message: 'Failed to generate recommendations list from AI.' });
    }
};


// =========================================================================
// FINAL EXPORT BLOCK (Resolves ReferenceError)
// =========================================================================
module.exports = {
    getAllConversations: exports.getAllConversations,
    getConversationHistory: exports.getConversationHistory,
    deleteConversation: exports.deleteConversation,
    generateRecommendationList: exports.generateRecommendationList, // <--- NEW EXPORT
};