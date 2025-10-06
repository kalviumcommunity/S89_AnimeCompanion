// backend/models/AnimeData.js
const mongoose = require('mongoose');

const CharacterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  info: { type: String, required: true },
  powers: { type: String, default: 'N/A' },
  voice_actor: { type: String, default: 'N/A' }
});

const AnimeDataSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  genres: [{ type: String }],
  studio: { type: String },
  episode_count: { type: Number },
  characters: [CharacterSchema], // Array of sub-documents
  // This field is ready for advanced RAG (Vector Search) later:
  lore_chunks: [{ type: String }] 
}, { timestamps: true });

// Create text index for efficient searching by title
AnimeDataSchema.index({ title: 'text' });

module.exports = mongoose.model('AnimeData', AnimeDataSchema);