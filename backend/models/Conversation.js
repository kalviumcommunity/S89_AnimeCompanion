// backend/models/Conversation.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: { 
    type: String, 
    enum: ['user', 'model'], 
    required: true 
  },
  text: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

const ConversationSchema = new mongoose.Schema({
  // Link this conversation to a specific User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // We'll give the conversation a default title
  title: {
    type: String,
    default: 'New Chat'
  },
  // Store the array of messages
  messages: [MessageSchema]
}, { timestamps: true }); // Automatically track creation/update time

module.exports = mongoose.model('Conversation', ConversationSchema);