// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    // Simple email regex for basic validation
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  password: { // NOTE: This will store the HASHED password in a real app
    type: String,
    required: true,
    minlength: 6 
  },
  // --- Data for Personalization/Recommendation Engine (Advanced RAG) ---
  preferences: {
    favorite_genres: [{
      type: String,
      enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Romance', 'Horror', 'Slice of Life', 'Adventure', 'Supernatural'],
      default: []
    }],
    disliked_genres: [{
        type: String,
        default: []
    }],
    preferred_studios: [{
        type: String,
        default: []
    }],
  },
  watch_history: [{
    anime_title: { type: String, required: true },
    watched_on: { type: Date, default: Date.now },
    rating: { type: Number, min: 1, max: 10 }
  }],
  // We can track chat sessions here too, but for simplicity, we'll focus on preferences for RAG
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);