const mongoose = require('mongoose');

// Define a schema for a single message in the chat history
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'model']
    },
    parts: {
        type: [new mongoose.Schema({
            text: { type: String },
            json: { type: mongoose.Schema.Types.Mixed }
        }, { _id: false })],
        required: true
    }
}, { _id: false });

// Define the main schema for a chat session
const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    history: {
        type: [messageSchema],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;