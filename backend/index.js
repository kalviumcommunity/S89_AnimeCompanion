// backend/index.js (Your main server file)

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const aiRoutes = require('./routes/ai.routes.js'); // Your AI routes
const userRoutes = require('./routes/user.routes.js');

// --- Configuration ---
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------
// Database Connection
// -----------------------------------------------------------------
const connectDB = async () => {
  try {
    // 1. Use mongoose.set('strictQuery', true) to prepare for Mongoose 7/8 default
    mongoose.set('strictQuery', true); 
    
    // 2. Use await for connection and log success/failure
    await mongoose.connect(MONGODB_URI);
    console.log('🔗 MongoDB connected successfully!');

    // 3. Start the server ONLY after the database is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('Application shutting down...');
    // Exit the process if the database connection fails
    process.exit(1); 
  }
};


// --- API Routes ---
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('Anime Companion Backend is running!');
});


// -----------------------------------------------------------------
// Start Application by connecting to the database first
// -----------------------------------------------------------------
connectDB();