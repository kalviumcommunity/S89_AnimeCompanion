// // backend/controllers/chat.controller.js
// const Conversation = require('../models/Conversation');
// const mongoose = require('mongoose');

// exports.getConversationHistory = async (req, res) => {
//     // 1. Get Conversation ID from URL parameter
//     const { conversationId } = req.params;
//     const userId = req.userId || null;

//     if (!userId) {
//         return res.status(401).json({ message: 'Unauthorized. Please log in to view history.' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(conversationId)) {
//         return res.status(400).json({ message: 'Invalid conversation ID format.' });
//     }

//     try {
//         // 2. Fetch the conversation, ensuring it belongs to the authenticated user
//         const conversation = await Conversation.findOne({
//             _id: conversationId,
//             userId: userId
//         }).select('messages title'); // Only retrieve the necessary fields

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
//         console.error('Error fetching conversation history:', error);
//         res.status(500).json({ message: 'Server error while retrieving history.' });
//     }
// };

// backend/controllers/chat.controller.js
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

// NEW FUNCTION: Fetches the list of all conversations for the user's history sidebar
exports.getAllConversations = async (req, res) => {
    const userId = req.userId;
    
    try {
        // FIX: Use the static method to create ObjectId from a string (avoids deprecation warning)
        const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId); 
        
        const conversations = await Conversation.find({ userId: userIdAsObjectId })
                                                .select('_id title updatedAt') 
                                                .sort({ updatedAt: -1 }); 

        res.json(conversations);

    } catch (error) {
        console.error('Error fetching ALL conversations:', error);
        // Add a check in case the string ID from the JWT is somehow malformed (CastError)
        if (error.name === 'CastError') {
             return res.status(400).json({ message: 'Invalid user ID format detected.' });
        }
        res.status(500).json({ message: 'Server error while retrieving conversations list.' });
    }
};


// Existing function for fetching a single conversation
exports.getConversationHistory = async (req, res) => {
    const { conversationId } = req.params;
    const userId = req.userId; 

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format.' });
    }

    try {
        // FIX: Use the static method for comparison
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: mongoose.Types.ObjectId.createFromHexString(userId) // Use static method here too
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