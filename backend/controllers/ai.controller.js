// // backend/controllers/ai.controller.js
// const {
//   ai,
//   systemInstruction,
//   model,
//   tuning
// } = require('../config/gemini.config.js'); // <-- REVISED PATH

// /**
//  * Handles the main chat interaction with the Gemini LLM.
//  */
// exports.generateResponse = async (req, res) => {
//   const { userPrompt, conversationHistory = [] } = req.body;

//   if (!userPrompt) {
//     return res.status(400).json({ error: 'User prompt is required.' });
//   }

//   try {
//     // 1. Prepare Conversation History for the Model
//     const history = conversationHistory.map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }]
//     }));

//     // Add the current user prompt to the history
//     const contents = [...history, { role: 'user', parts: [{ text: userPrompt }] }];

//     // 2. Call the Gemini Model
//     const response = await ai.models.generateContent({
//       model: model,
//       contents: contents,
//       config: {
//         systemInstruction: systemInstruction,
//         temperature: tuning.temperature,
//         maxOutputTokens: tuning.maxOutputTokens,
//       }
//     });

//     const aiResponseText = response.text;

//     // 3. Send the AI's response back to the frontend
//     res.json({
//       text: aiResponseText,
//     });

//   } catch (error) {
//     console.error('Gemini API Error:', error);
//     res.status(500).json({
//       error: 'Failed to generate response from AI.',
//       details: error.message
//     });
//   }
// };


// // backend/controllers/ai.controller.js
// const {
//   ai,
//   systemInstruction,
//   model,
//   tuning
// } = require('../config/gemini.config.js');

// // -------------------------------------------------------------------------
// // RAG INTEGRATION: Import Mongoose Model
// const AnimeData = require('../models/AnimeData');
// // -------------------------------------------------------------------------

// // =========================================================================
// // 1. TOOL DEFINITIONS (Function Schemas) - REMAIN UNCHANGED
// // =========================================================================

// const customTools = [
//   {
//     function_declaration: {
//       name: 'get_anime_summary',
//       description: 'Fetches a detailed summary (plot, studio, episode count, genres) for a specific anime title.',
//       parameters: {
//         type: 'OBJECT',
//         properties: {
//           anime_title: {
//             type: 'STRING',
//             description: 'The exact title of the anime series to look up.',
//           },
//         },
//         required: ['anime_title'],
//       },
//     },
//   },
//   {
//     function_declaration: {
//       name: 'fetch_character_info',
//       description: 'Retrieves detailed information (voice actor, powers, background) about a specific character from a given anime.',
//       parameters: {
//         type: 'OBJECT',
//         properties: {
//           anime_title: {
//             type: 'STRING',
//             description: 'The title of the anime the character belongs to.',
//           },
//           character_name: {
//             type: 'STRING',
//             description: 'The exact name of the character.',
//           },
//         },
//         required: ['anime_title', 'character_name'],
//       },
//     },
//   },
// ];

// const tools = [
//     ...customTools,
//     { googleSearch: {} } // Hybrid: Includes Google Search grounding
// ];


// // =========================================================================
// // 2. UPDATED TOOL IMPLEMENTATIONS (Using Mongoose/RAG)
// // NOTE: Functions must now be 'async'
// // =========================================================================

// const get_anime_summary = async ({ anime_title }) => {
//   console.log(`Tool Called: get_anime_summary for ${anime_title}`);
  
//   try {
//     // Mongoose Query: Find the anime by title (case-insensitive regex)
//     const anime = await AnimeData.findOne({ 
//         title: { $regex: new RegExp(anime_title, 'i') } 
//     }).select('title summary genres studio episode_count'); // Use .select() to get only necessary fields (best practice)

//     if (anime) {
//       // Format the structured data into a concise string for the LLM
//       return {
//         status: 'success',
//         // Use lean() method for better performance if not using Mongoose virtuals
//         data: `Title: ${anime.title}. Summary: ${anime.summary}. Genres: ${anime.genres.join(', ')}. Studio: ${anime.studio}. Episodes: ${anime.episode_count}.`
//       };
//     }
//     return { status: 'error', message: `Anime not found for summary: ${anime_title}.` };

//   } catch (error) {
//     console.error("Database error in get_anime_summary:", error);
//     return { status: 'error', message: 'Failed to access anime database for summary.' };
//   }
// };

// const fetch_character_info = async ({ anime_title, character_name }) => {
//   console.log(`Tool Called: fetch_character_info for ${character_name} in ${anime_title}`);

//   try {
//     // 1. Find the anime document by title
//     const anime = await AnimeData.findOne({ 
//         title: { $regex: new RegExp(anime_title, 'i') } 
//     }).lean(); // Use .lean() for faster retrieval if you don't need Mongoose Document methods

//     if (anime) {
//       // 2. Search for the character within the characters array
//       const character = anime.characters.find(char => 
//         char.name.toLowerCase().includes(character_name.toLowerCase())
//       );

//       if (character) {
//         // Format the structured data for the LLM
//         return {
//           status: 'success',
//           data: `Character Name: ${character.name}. Anime: ${anime.title}. Info: ${character.info}. Powers: ${character.powers}. Voice Actor: ${character.voice_actor}.`
//         };
//       }
//       return { status: 'error', message: `Character ${character_name} not found in ${anime_title}.` };
//     }
//     return { status: 'error', message: `Anime ${anime_title} not found.` };

//   } catch (error) {
//     console.error("Database error in fetch_character_info:", error);
//     return { status: 'error', message: 'Failed to access anime database for character info.' };
//   }
// };

// // Map function names to their actual implementations (must be async)
// const availableFunctions = {
//   get_anime_summary,
//   fetch_character_info,
// };


// // =========================================================================
// // 3. MAIN CONTROLLER LOGIC (Remains largely the same, but handles async functions)
// // =========================================================================

// exports.generateResponse = async (req, res) => {
//   const { userPrompt, conversationHistory = [] } = req.body;
//   if (!userPrompt) {
//     return res.status(400).json({ error: 'User prompt is required.' });
//   }

//   try {
//     const history = conversationHistory.map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }]
//     }));
//     let contents = [...history, { role: 'user', parts: [{ text: userPrompt }] }];

//     // --- First Call ---
//     let response = await ai.models.generateContent({
//       model: model,
//       contents: contents,
//       config: {
//         systemInstruction: systemInstruction,
//         temperature: tuning.temperature,
//         maxOutputTokens: tuning.maxOutputTokens,
//       },
//       tools: tools,
//     });

//     // --- Check for Custom Function Call ---
//     if (response.functionCalls && response.functionCalls.length > 0) {
//       const call = response.functionCalls[0];
//       const functionName = call.name;
//       const functionArgs = call.args;

//       if (availableFunctions[functionName]) {
//         console.log(`Executing custom tool: ${functionName} with arguments:`, functionArgs);
        
//         // EXECUTE THE ASYNC FUNCTION (Key Change: using await here)
//         const functionResult = await availableFunctions[functionName](functionArgs); 

//         // Update contents with model's call and tool's result
//         contents = [
//           ...contents,
//           {
//             role: 'model',
//             parts: [{ functionCall: call }],
//           },
//           {
//             role: 'tool',
//             parts: [{
//               functionResponse: {
//                 name: functionName,
//                 response: functionResult,
//               },
//             }],
//           },
//         ];

//         // --- Second LLM Call ---
//         response = await ai.models.generateContent({
//           model: model,
//           contents: contents,
//           config: {
//             systemInstruction: systemInstruction,
//             temperature: tuning.temperature,
//             maxOutputTokens: tuning.maxOutputTokens,
//           },
//           tools: tools,
//         });
//       } else {
//         console.error(`Unknown function: ${functionName}`);
//       }
//     }

//     // --- Final Response ---
//     res.json({
//       text: response.text,
//     });

//   } catch (error) {
//     console.error('Gemini API Error (with Function Calling):', error);
//     res.status(500).json({
//       error: 'Failed to generate response from AI.',
//       details: error.message
//     });
//   }
// };

// // backend/controllers/ai.controller.js
// const {
//   ai,
//   systemInstruction,
//   model,
//   tuning
// } = require('../config/gemini.config.js');

// // -------------------------------------------------------------------------
// // RAG INTEGRATION: Import Mongoose Models
// const AnimeData = require('../models/AnimeData');
// const User = require('../models/User'); // <--- IMPORT for personalization
// // -------------------------------------------------------------------------

// // =========================================================================
// // 1. TOOL DEFINITIONS (Function Schemas) - FINAL VERSION
// // =========================================================================

// const customTools = [
//   {
//     function_declaration: {
//       name: 'get_anime_summary',
//       description: 'Fetches a detailed summary (plot, studio, episode count, genres) for a specific anime title.',
//       parameters: {
//         type: 'OBJECT',
//         properties: {
//           anime_title: {
//             type: 'STRING',
//             description: 'The exact title of the anime series to look up.',
//           },
//         },
//         required: ['anime_title'],
//       },
//     },
//   },
//   {
//     function_declaration: {
//       name: 'fetch_character_info',
//       description: 'Retrieves detailed information (voice actor, powers, background) about a specific character from a given anime.',
//       parameters: {
//         type: 'OBJECT',
//         properties: {
//           anime_title: {
//             type: 'STRING',
//             description: 'The title of the anime the character belongs to.',
//           },
//           character_name: {
//             type: 'STRING',
//             description: 'The exact name of the character.',
//           },
//         },
//         required: ['anime_title', 'character_name'],
//       },
//     },
//   },
//   // ------------------------------------------------------------------
//   // --- NEW TOOL FOR PERSONALIZATION (WITH FORCEFUL DESCRIPTION) ---
//   {
//     function_declaration: {
//       name: 'fetch_user_preferences',
//       description: 'Retrieves the current user\'s favorite genres, disliked genres, and watch history for personalized anime recommendations. **IMPORTANT: ALWAYS CALL THIS TOOL WHEN THE USER ASKS FOR A RECOMMENDATION, AS IT CONTAINS THE NECESSARY CONTEXT.**',
//       parameters: {
//         type: 'OBJECT',
//         properties: {
//           user_id: {
//             type: 'STRING',
//             description: 'The ID of the currently logged-in user.',
//           },
//         },
//         required: ['user_id'],
//       },
//     },
//   },
//   // ------------------------------------------------------------------
// ];

// const tools = [
//     ...customTools,
//     { googleSearch: {} } // Hybrid: Includes Google Search grounding
// ];


// // =========================================================================
// // 2. UPDATED TOOL IMPLEMENTATIONS (Mongoose/RAG) - All are async
// // =========================================================================

// const get_anime_summary = async ({ anime_title }) => {
//   console.log(`Tool Called: get_anime_summary for ${anime_title}`);
  
//   try {
//     const anime = await AnimeData.findOne({ 
//         title: { $regex: new RegExp(anime_title, 'i') } 
//     }).select('title summary genres studio episode_count');

//     if (anime) {
//       return {
//         status: 'success',
//         data: `Title: ${anime.title}. Summary: ${anime.summary}. Genres: ${anime.genres.join(', ')}. Studio: ${anime.studio}. Episodes: ${anime.episode_count}.`
//       };
//     }
//     return { status: 'error', message: `Anime not found for summary: ${anime_title}.` };

//   } catch (error) {
//     console.error("Database error in get_anime_summary:", error);
//     return { status: 'error', message: 'Failed to access anime database for summary.' };
//   }
// };

// const fetch_character_info = async ({ anime_title, character_name }) => {
//   console.log(`Tool Called: fetch_character_info for ${character_name} in ${anime_title}`);

//   try {
//     const anime = await AnimeData.findOne({ 
//         title: { $regex: new RegExp(anime_title, 'i') } 
//     }).lean(); 

//     if (anime) {
//       const character = anime.characters.find(char => 
//         char.name.toLowerCase().includes(character_name.toLowerCase())
//       );

//       if (character) {
//         return {
//           status: 'success',
//           data: `Character Name: ${character.name}. Anime: ${anime.title}. Info: ${character.info}. Powers: ${character.powers}. Voice Actor: ${character.voice_actor}.`
//         };
//       }
//       return { status: 'error', message: `Character ${character_name} not found in ${anime_title}.` };
//     }
//     return { status: 'error', message: `Anime ${anime_title} not found.` };

//   } catch (error) {
//     console.error("Database error in fetch_character_info:", error);
//     return { status: 'error', message: 'Failed to access anime database for character info.' };
//   }
// };

// const fetch_user_preferences = async ({ user_id }) => {
//   console.log(`Tool Called: fetch_user_preferences for user ID: ${user_id}`);
  
//   // NOTE: The unauthenticated user will pass a null user_id, which Mongoose will likely reject.
//   // This is desired, as they shouldn't get personalized data.
//   try {
//     const user = await User.findById(user_id)
//         .select('preferences watch_history username')
//         .lean(); 

//     if (user) {
//       return {
//         status: 'success',
//         data: JSON.stringify({
//             username: user.username,
//             favorite_genres: user.preferences.favorite_genres.join(', '),
//             disliked_genres: user.preferences.disliked_genres.join(', '),
//             watch_history_count: user.watch_history.length,
//             last_watched: user.watch_history.slice(-3).map(h => h.anime_title).join(', ')
//         })
//       };
//     }
//     return { 
//         status: 'error', 
//         message: 'User preferences not found. User is either new or ID is invalid.' 
//     };

//   } catch (error) {
//     console.error("Database error in fetch_user_preferences:", error);
//     // Specifically log database errors caused by bad ID format (CastError)
//     if (error.name === 'CastError') {
//         return { status: 'error', message: 'Database query failed due to malformed user ID.' };
//     }
//     return { status: 'error', message: 'Failed to access user database.' };
//   }
// };

// const availableFunctions = {
//   get_anime_summary: get_anime_summary,
//   fetch_character_info: fetch_character_info,
//   fetch_user_preferences: fetch_user_preferences,
// };


// // =========================================================================
// // 3. MAIN CONTROLLER LOGIC (Handles Hybrid Function Calling Loop)
// // =========================================================================

// exports.generateResponse = async (req, res) => {
//   // --- AUTOMATICALLY GET USER ID FROM MIDDLEWARE (No more hardcoding) ---
//   const { userPrompt, conversationHistory = [] } = req.body; 
//   const userId = req.userId || null; // Will be the actual ID or null from authMiddleware
  
//   if (!userPrompt) {
//     return res.status(400).json({ error: 'User prompt is required.' });
//   }

//   try {
//     const history = conversationHistory.map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }]
//     }));
//     let contents = [...history, { role: 'user', parts: [{ text: userPrompt }] }];

//     // --- First Call ---
//     let response = await ai.models.generateContent({
//       model: model,
//       contents: contents,
//       config: {
//         systemInstruction: systemInstruction,
//         temperature: tuning.temperature,
//         maxOutputTokens: tuning.maxOutputTokens,
//       },
//       tools: tools,
//     });

//     // --- Check for Custom Function Call ---
//     if (response.functionCalls && response.functionCalls.length > 0) {
//       const call = response.functionCalls[0];
//       const functionName = call.name;
//       let functionArgs = call.args;

//       if (availableFunctions[functionName]) {
//         // INJECT THE USER ID (ONLY IF LOGGED IN) BEFORE EXECUTION
//         if (functionName === 'fetch_user_preferences') {
//             if (userId) {
//                 functionArgs.user_id = userId; 
//             } else {
//                 // If not authenticated, the request should fail gracefully,
//                 // passing a null ID which the function will handle.
//                 functionArgs.user_id = null; 
//                 console.warn('Recommendation requested but user is unauthenticated. Passing null ID to RAG tool.');
//             }
//         }

//         console.log(`Executing custom tool: ${functionName} with arguments:`, functionArgs);
        
//         const functionResult = await availableFunctions[functionName](functionArgs); 

//         // Update contents with model's call and tool's result
//         contents = [
//           ...contents,
//           {
//             role: 'model',
//             parts: [{ functionCall: call }],
//           },
//           {
//             role: 'tool',
//             parts: [{
//               functionResponse: {
//                 name: functionName,
//                 response: functionResult,
//               },
//             }],
//           },
//         ];

//         // --- Second LLM Call ---
//         response = await ai.models.generateContent({
//           model: model,
//           contents: contents,
//           config: {
//             systemInstruction: systemInstruction,
//             temperature: tuning.temperature,
//             maxOutputTokens: tuning.maxOutputTokens,
//           },
//           tools: tools,
//         });
//       } else {
//         console.error(`Unknown function: ${functionName}`);
//       }
//     }

//     // --- Final Response ---
//     res.json({
//       text: response.text,
//     });

//   } catch (error) {
//     console.error('Gemini API Error (with Function Calling):', error);
//     res.status(500).json({
//       error: 'Failed to generate response from AI.',
//       details: error.message
//     });
//   }
// };


// backend/controllers/ai.controller.js
const {
  ai,
  systemInstruction,
  model,
  tuning
} = require('../config/gemini.config.js');

// -------------------------------------------------------------------------
// RAG INTEGRATION: Import Mongoose Models
const AnimeData = require('../models/AnimeData');
const User = require('../models/User'); 
const Conversation = require('../models/Conversation'); // <--- CRITICAL: Import the Conversation Model
// -------------------------------------------------------------------------

// =========================================================================
// 1. TOOL DEFINITIONS (Function Schemas) - UNCHANGED
// =========================================================================

const customTools = [
  {
    function_declaration: {
      name: 'get_anime_summary',
      description: 'Fetches a detailed summary (plot, studio, episode count, genres) for a specific anime title.',
      parameters: {
        type: 'OBJECT',
        properties: {
          anime_title: {
            type: 'STRING',
            description: 'The exact title of the anime series to look up.',
          },
        },
        required: ['anime_title'],
      },
    },
  },
  {
    function_declaration: {
      name: 'fetch_character_info',
      description: 'Retrieves detailed information (voice actor, powers, background) about a specific character from a given anime.',
      parameters: {
        type: 'OBJECT',
        properties: {
          anime_title: {
            type: 'STRING',
            description: 'The title of the anime the character belongs to.',
          },
          character_name: {
            type: 'STRING',
            description: 'The exact name of the character.',
          },
        },
        required: ['anime_title', 'character_name'],
      },
    },
  },
  {
    function_declaration: {
      name: 'fetch_user_preferences',
      description: 'Retrieves the current user\'s favorite genres, disliked genres, and watch history for personalized anime recommendations. **IMPORTANT: ALWAYS CALL THIS TOOL WHEN THE USER ASKS FOR A RECOMMENDATION, AS IT CONTAINS THE NECESSARY CONTEXT.**',
      parameters: {
        type: 'OBJECT',
        properties: {
          user_id: {
            type: 'STRING',
            description: 'The ID of the currently logged-in user.',
          },
        },
        required: ['user_id'],
      },
    },
  },
];

const tools = [
    ...customTools,
    { googleSearch: {} } // Hybrid: Includes Google Search grounding
];


// =========================================================================
// 2. UPDATED TOOL IMPLEMENTATIONS (Mongoose/RAG) - UNCHANGED
// =========================================================================

const get_anime_summary = async ({ anime_title }) => {
  console.log(`Tool Called: get_anime_summary for ${anime_title}`);
  
  try {
    const anime = await AnimeData.findOne({ 
        title: { $regex: new RegExp(anime_title, 'i') } 
    }).select('title summary genres studio episode_count');

    if (anime) {
      return {
        status: 'success',
        data: `Title: ${anime.title}. Summary: ${anime.summary}. Genres: ${anime.genres.join(', ')}. Studio: ${anime.studio}. Episodes: ${anime.episode_count}.`
      };
    }
    return { status: 'error', message: `Anime not found for summary: ${anime_title}.` };

  } catch (error) {
    console.error("Database error in get_anime_summary:", error);
    return { status: 'error', message: 'Failed to access anime database for summary.' };
  }
};

const fetch_character_info = async ({ anime_title, character_name }) => {
  console.log(`Tool Called: fetch_character_info for ${character_name} in ${anime_title}`);

  try {
    const anime = await AnimeData.findOne({ 
        title: { $regex: new RegExp(anime_title, 'i') } 
    }).lean(); 

    if (anime) {
      const character = anime.characters.find(char => 
        char.name.toLowerCase().includes(character_name.toLowerCase())
      );

      if (character) {
        return {
          status: 'success',
          data: `Character Name: ${character.name}. Anime: ${anime.title}. Info: ${character.info}. Powers: ${character.powers}. Voice Actor: ${character.voice_actor}.`
        };
      }
      return { status: 'error', message: `Character ${character_name} not found in ${anime_title}.` };
    }
    return { status: 'error', message: `Anime ${anime_title} not found.` };

  } catch (error) {
    console.error("Database error in fetch_character_info:", error);
    return { status: 'error', message: 'Failed to access anime database for character info.' };
  }
};

const fetch_user_preferences = async ({ user_id }) => {
  console.log(`Tool Called: fetch_user_preferences for user ID: ${user_id}`);
  
  try {
    const user = await User.findById(user_id)
        .select('preferences watch_history username')
        .lean(); 

    if (user) {
      return {
        status: 'success',
        data: JSON.stringify({
            username: user.username,
            favorite_genres: user.preferences.favorite_genres.join(', '),
            disliked_genres: user.preferences.disliked_genres.join(', '),
            watch_history_count: user.watch_history.length,
            last_watched: user.watch_history.slice(-3).map(h => h.anime_title).join(', ')
        })
      };
    }
    return { 
        status: 'error', 
        message: 'User preferences not found. User is either new or ID is invalid.' 
    };

  } catch (error) {
    console.error("Database error in fetch_user_preferences:", error);
    if (error.name === 'CastError') {
        return { status: 'error', message: 'Database query failed due to malformed user ID.' };
    }
    return { status: 'error', message: 'Failed to access user database.' };
  }
};

const availableFunctions = {
  get_anime_summary: get_anime_summary,
  fetch_character_info: fetch_character_info,
  fetch_user_preferences: fetch_user_preferences,
};


// =========================================================================
// 3. MAIN CONTROLLER LOGIC (Handles History, RAG, and Function Calling Loop)
// =========================================================================

exports.generateResponse = async (req, res) => {
  // Extract userPrompt and conversationId from the body
  const { userPrompt, conversationId } = req.body; 
  // Get userId from authMiddleware
  const userId = req.userId || null; 
  
  if (!userPrompt) {
    return res.status(400).json({ error: 'User prompt is required.' });
  }

  let conversation;
  let history = []; 

  try {
    // --------------------------------------------------------------------------
    // --- STEP A: HANDLE CONVERSATION RETRIEVAL/CREATION (Persistence) ---
    // --------------------------------------------------------------------------
    if (userId) { // Only handle history if the user is logged in
        if (conversationId) {
            // Retrieve existing conversation
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
            if (conversation) {
                history = conversation.messages;
            }
        } 
        
        // If still no conversation (first message or invalid ID), create a new one
        if (!conversation) {
            // New Conversation object created but NOT saved yet (saved after AI response)
            conversation = new Conversation({ userId: userId }); 
        }
    }
    
    // The user's current message object for persistence
    const newUserMessage = { sender: 'user', text: userPrompt };

    // Prepare conversation history for the LLM API call
    const contentsForLLM = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    
    let contents = [...contentsForLLM, { role: 'user', parts: [{ text: userPrompt }] }];

    // --- First Call (and Function Calling Loop remains the same) ---
    let response = await ai.models.generateContent({
      model: model,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: tuning.temperature,
        maxOutputTokens: tuning.maxOutputTokens,
      },
      tools: tools,
    });

    // --------------------------------------------------------------------------
    // --- STEP B: FUNCTION CALLING LOOP (CRITICAL: Must handle tool execution) ---
    // --------------------------------------------------------------------------

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const functionName = call.name;
      let functionArgs = call.args;

      if (availableFunctions[functionName]) {
        if (functionName === 'fetch_user_preferences') {
            if (userId) {
                functionArgs.user_id = userId; 
            } else {
                functionArgs.user_id = null; 
                console.warn('Recommendation requested but user is unauthenticated. Passing null ID to RAG tool.');
            }
        }

        console.log(`Executing custom tool: ${functionName} with arguments:`, functionArgs);
        
        const functionResult = await availableFunctions[functionName](functionArgs); 

        contents = [
          ...contents,
          {
            role: 'model',
            parts: [{ functionCall: call }],
          },
          {
            role: 'tool',
            parts: [{
              functionResponse: {
                name: functionName,
                response: functionResult,
              },
            }],
          },
        ];

        // --- Second LLM Call ---
        response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: tuning.temperature,
            maxOutputTokens: tuning.maxOutputTokens,
          },
          tools: tools,
        });
      } else {
        console.error(`Unknown function: ${functionName}`);
      }
    }


    // --------------------------------------------------------------------------
    // --- STEP C: SAVE THE NEW CONVERSATION TURN (Persistence) ---
    // --------------------------------------------------------------------------

    const aiResponseText = response.text;
    const newModelMessage = { sender: 'model', text: aiResponseText };
    
    if (conversation) { // Only save if a conversation object exists (i.e., user is logged in)
        // 1. Add the new messages to the conversation document
        conversation.messages.push(newUserMessage);
        conversation.messages.push(newModelMessage);
        
        // 2. If this is the first message, set a title
        if (conversation.messages.length <= 2 && conversation.title === 'New Chat') {
            conversation.title = userPrompt.substring(0, 30).trim() + '...';
        }
        
        // 3. Save the updated conversation document
        await conversation.save();
    }


    // --- Final Response ---
    res.json({
      text: aiResponseText,
      conversationId: conversation ? conversation._id : null, // <--- RETURN NEW/EXISTING ID
    });

  } catch (error) {
    console.error('Gemini API/Persistence Error:', error);
    res.status(500).json({
      error: 'Failed to generate response from AI or save history.',
      details: error.message
    });
  }
};