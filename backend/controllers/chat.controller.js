

// // backend/controllers/chat.controller.js
// const Conversation = require('../models/Conversation');
// const mongoose = require('mongoose');

// // =========================================================================
// // FUNCTION TO LIST ALL CONVERSATIONS FOR A USER
// // (GET /api/ai/conversations)
// // =========================================================================
// exports.getAllConversations = async (req, res) => {
//     // userId is attached by the requireAuth middleware
//     const userId = req.userId;
    
//     // We already know the userId is a string from the JWT, but we must convert it
//     // to an ObjectId before querying the database.
    
//     try {
//         // Use the static method for conversion to ObjectId
//         const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId); 
        
//         const conversations = await Conversation.find({ userId: userIdAsObjectId })
//                                                 .select('_id title updatedAt') 
//                                                 .sort({ updatedAt: -1 }); // Sort by newest first

//         res.json(conversations);

//     } catch (error) {
//         console.error('Error fetching ALL conversations:', error);
        
//         // Catches errors if the string ID from the JWT payload is malformed
//         if (error.name === 'CastError') {
//              return res.status(400).json({ message: 'Invalid user ID format detected.' });
//         }
//         res.status(500).json({ message: 'Server error while retrieving conversations list.' });
//     }
// };


// // =========================================================================
// // FUNCTION TO FETCH A SINGLE CONVERSATION'S MESSAGES
// // (GET /api/ai/conversations/:conversationId)
// // =========================================================================
// exports.getConversationHistory = async (req, res) => {
//     const { conversationId } = req.params;
//     // userId is attached by the requireAuth middleware
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

// backend/controllers/chat.controller.js
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

// =========================================================================
// FUNCTION TO LIST ALL CONVERSATIONS FOR A USER (GET /api/ai/conversations)
// =========================================================================
exports.getAllConversations = async (req, res) => {
    // userId is attached by the requireAuth middleware
    const userId = req.userId;
    
    try {
        // Convert userId to ObjectId for querying the database.
        const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId); 
        
        const conversations = await Conversation.find({ userId: userIdAsObjectId })
                                                .select('_id title updatedAt') 
                                                .sort({ updatedAt: -1 }); // Sort by newest first

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

    // 1. Validate the conversation ID format immediately
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format.' });
    }

    try {
        // Convert userId to ObjectId for robust comparison
        const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(userId);
        
        // 2. Fetch the conversation, ensuring it belongs to the authenticated user
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: userIdAsObjectId 
        }).select('messages title'); 

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found or access denied.' });
        }

        // 3. Return the history
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
        // Find the conversation and DELETE it, ensuring the userId matches
        const result = await Conversation.deleteOne({
            _id: conversationId,
            userId: userId // Security check: must belong to the user
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found or access denied.' });
        }

        // Return success
        res.status(200).json({ message: 'Conversation deleted successfully.', deletedId: conversationId });

    } catch (error) {
        console.error('Error deleting conversation:', error);
        res.status(500).json({ message: 'Server error during conversation deletion.' });
    }
};


// =========================================================================
// FINAL EXPORT BLOCK
// =========================================================================
module.exports = {
    getAllConversations: exports.getAllConversations,
    getConversationHistory: exports.getConversationHistory,
    deleteConversation: exports.deleteConversation,
};