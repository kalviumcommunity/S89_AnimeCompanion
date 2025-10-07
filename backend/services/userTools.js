// backend/services/userTools.js
const User = require('../models/User'); 
const mongoose = require('mongoose');

/**
 * Tool: Retrieves user preferences for recommendations.
 */
const fetch_user_preferences = async ({ user_id }) => {
  // CRITICAL LOG: Log the received ID immediately
  console.log(`[RAG Tool] START: fetch_user_preferences for user ID: ${user_id}`);
  
  if (!user_id) {
    return { 
        status: 'error', 
        message: 'User is unauthenticated. Cannot fetch preferences for recommendation.' 
    };
  }

  try {
    // Check if the ID is valid before attempting conversion/query
    if (!mongoose.Types.ObjectId.isValid(user_id)) {
        console.error(`[RAG Tool] Invalid ID format: ${user_id}`);
         return { status: 'error', message: 'Invalid user ID format received.' };
    }
    
    // Uses the static method to create the ObjectId
    const userIdAsObjectId = mongoose.Types.ObjectId.createFromHexString(user_id);

    const user = await User.findById(userIdAsObjectId)
        .select('preferences watch_history username')
        .lean(); 

    if (user) {
      // LOG SUCCESSFUL DATA RETRIEVAL
      console.log(`[RAG Tool] SUCCESS: User data retrieved for ${user.username}`);
      
      return {
        status: 'success',
        data: JSON.stringify({
            username: user.username,
            // Ensure array joins are safe even if arrays are empty or null
            favorite_genres: user.preferences.favorite_genres?.join(', ') || 'None', 
            disliked_genres: user.preferences.disliked_genres?.join(', ') || 'None',
            watch_history_count: user.watch_history?.length || 0,
            last_watched: user.watch_history?.slice(-3).map(h => h.anime_title).join(', ') || 'None'
        })
      };
    }
    return { 
        status: 'error', 
        message: 'User preferences not found. User is new or ID is invalid.' 
    };

  } catch (error) {
    // CRITICAL LOG: Capture any database or processing error
    console.error("[RAG Tool] FATAL ERROR in fetch_user_preferences:", error);
    if (error.name === 'CastError') {
        return { status: 'error', message: 'Database query failed due to malformed user ID.' };
    }
    return { status: 'error', message: 'Failed to access user database.' };
  }
};

module.exports = {
    fetch_user_preferences
};