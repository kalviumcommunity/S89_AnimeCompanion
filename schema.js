const mongoose = require('mongoose');

// Define the schema for the 'parts' array inside a message
const partSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    }
}, { _id: false }); // Disable the default _id for subdocuments

// Define the schema for a single message in the chat history
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        enum: ['user', 'model']
    },
    parts: {
        type: [partSchema],
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

// Create and export the Mongoose model
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

module.exports = ChatSession;