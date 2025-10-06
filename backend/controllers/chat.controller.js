// backend/controllers/chat.controller.js
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

exports.getConversationHistory = async (req, res) => {
    // 1. Get Conversation ID from URL parameter
    const { conversationId } = req.params;
    const userId = req.userId || null;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in to view history.' });
    }

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: 'Invalid conversation ID format.' });
    }

    try {
        // 2. Fetch the conversation, ensuring it belongs to the authenticated user
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: userId
        }).select('messages title'); // Only retrieve the necessary fields

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
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ message: 'Server error while retrieving history.' });
    }
};