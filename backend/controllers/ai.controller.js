
// // backend/controllers/ai.controller.js (FINAL, STABLE VERSION)
// const {
//   ai,
//   systemInstruction,
//   model,
//   tuning
// } = require('../config/gemini.config.js');
// const mongoose = require('mongoose');

// // -------------------------------------------------------------------------
// // RAG INTEGRATION: Import only what is needed for the controller logic
// const Conversation = require('../models/Conversation');
// // Import functions from the new service files 
// const { get_anime_summary, fetch_character_info } = require('../services/animeTools');
// const { fetch_user_preferences } = require('../services/userTools');
// // -------------------------------------------------------------------------

// // =========================================================================
// // 1. TOOL DEFINITIONS (Function Schemas)
// // =========================================================================
// // NOTE: Schemas must remain here for the FIRST Gemini API call configuration.

// const customTools = [
//   { function_declaration: { name: 'get_anime_summary', description: 'Fetches a detailed summary (plot, studio, episode count, genres) for a specific anime title.', parameters: { type: 'OBJECT', properties: { anime_title: { type: 'STRING' } }, required: ['anime_title'] } } },
//   { function_declaration: { name: 'fetch_character_info', description: 'Retrieves detailed information (voice actor, powers, background) about a specific character from a given anime.', parameters: { type: 'OBJECT', properties: { anime_title: { type: 'STRING' }, character_name: { type: 'STRING' } }, required: ['anime_title', 'character_name'] } } },
//   { function_declaration: { name: 'fetch_user_preferences', description: 'Retrieves the current user\'s favorite genres, disliked genres, and watch history for personalized anime recommendations. **IMPORTANT: ALWAYS CALL THIS TOOL WHEN THE USER ASKS FOR A RECOMMENDATION, AS IT CONTAINS THE NECESSARY CONTEXT.**', parameters: { type: 'OBJECT', properties: { user_id: { type: 'STRING', description: 'The ID of the currently logged-in user.' } }, required: ['user_id'] } } },
// ];

// const tools = [
//     ...customTools,
//     { googleSearch: {} } 
// ];

// // =========================================================================
// // 2. AVAILABLE FUNCTIONS MAP (Links schema names to imported execution functions)
// // =========================================================================
// const availableFunctions = {
//   get_anime_summary,
//   fetch_character_info,
//   fetch_user_preferences,
// };


// // =========================================================================
// // 3. MAIN CONTROLLER LOGIC (Handles History, RAG, and Function Calling Loop)
// // =========================================================================

// exports.generateResponse = async (req, res) => {
//   const { userPrompt, conversationId } = req.body; 
//   const userId = req.userId || null; 
  
//   if (!userPrompt) {
//     return res.status(400).json({ error: 'User prompt is required.' });
//   }

//   let conversation;
//   let history = []; 

//   try {
//     // --------------------------------------------------------------------------
//     // --- STEP A: HANDLE CONVERSATION RETRIEVAL/CREATION (Persistence) ---
//     // --------------------------------------------------------------------------
//     if (userId) { 
//         if (conversationId) {
//             conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
//             if (conversation) {
//                 // Filter out any corrupt messages from old data before sending to LLM
//                 history = conversation.messages.filter(msg => msg.text && msg.sender);
//             }
//         } 
//         if (!conversation) {
//             conversation = new Conversation({ userId: userId }); 
//         }
//     }
    
//     const newUserMessage = { sender: 'user', text: userPrompt };
//     const contentsForLLM = history.map(msg => ({
//       role: msg.sender === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.text }]
//     }));
//     let contents = [...contentsForLLM, { role: 'user', parts: [{ text: userPrompt }] }];

//     // --- First Call (Includes tools to allow function calling) ---
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

//     // --------------------------------------------------------------------------
//     // --- STEP B: FUNCTION CALLING LOOP (Robust against looping) ---
//     // --------------------------------------------------------------------------
//     let loopCount = 0; 
//     const MAX_LOOPS = 2; // Safety limit

//     while (response.functionCalls && response.functionCalls.length > 0 && loopCount < MAX_LOOPS) {
//       const call = response.functionCalls[0];
//       const functionName = call.name;
//       let functionArgs = call.args;

//       if (!availableFunctions[functionName]) {
//         console.error(`Unknown function: ${functionName}. Breaking loop.`);
//         break; 
//       }
      
//       // Inject userId for preference tool before execution
//       if (functionName === 'fetch_user_preferences') {
//           functionArgs.user_id = userId || null; 
//       }

//       console.log(`Executing custom tool: ${functionName} (Loop ${loopCount + 1})`);
      
//       // *** EXECUTES THE IMPORTED FUNCTION FROM THE SERVICES FOLDER ***
//       const functionResult = await availableFunctions[functionName](functionArgs); 

//       // CRITICAL LOG: Log the result received from the service function
//       console.log(`[Controller] Result from ${functionName}:`, functionResult);

//       contents.push({ role: 'model', parts: [{ functionCall: call }] });
//       contents.push({ role: 'tool', parts: [{ functionResponse: { name: functionName, response: functionResult } }] });

//       // --- Next LLM Call (Second Call - NO TOOLS) ---
//       response = await ai.models.generateContent({
//         model: model,
//         contents: contents,
//         config: { 
//           // CRITICAL: We pass the standard config
//           systemInstruction: systemInstruction, 
//           temperature: tuning.temperature, 
//           maxOutputTokens: tuning.maxOutputTokens 
//         },
//         tools: [], // <--- FINAL FIX: Explicitly remove tools to force text output
//       });
      
//       // --- DEBUG LOGS ---
//       console.log("LLM Response Text After Tool:", response.text);
//       console.log("LLM Response Function Calls After Tool:", response.functionCalls); 
//       // ------------------

//       loopCount++; 
//     }
    
//     // Safety Fallback for Looping or Empty Response
//     let aiResponseText = response.text;
//     if (loopCount === MAX_LOOPS && !aiResponseText) {
//         aiResponseText = "I seem to be stuck processing your request. Please try rephrasing, or check the server logs for tool execution issues.";
//         console.error("Function Calling Loop Exceeded MAX_LOOPS. Forcing Text Fallback.");
//     }
    
//     // --------------------------------------------------------------------------
//     // --- STEP C: SAVE THE NEW CONVERSATION TURN (Persistence) ---
//     // --------------------------------------------------------------------------

//     const newModelMessage = { sender: 'model', text: aiResponseText };
    
//     // CRITICAL FIX: Only save if the AI provided a non-empty text response.
//     if (conversation && aiResponseText && aiResponseText.length > 0) { 
//         conversation.messages.push(newUserMessage); 
//         conversation.messages.push(newModelMessage); 
        
//         if (conversation.messages.length <= 2 && conversation.title === 'New Chat') {
//             conversation.title = userPrompt.substring(0, 30).trim() + '...';
//         }
        
//         await conversation.save();
//     }


//     // --- Final Response ---
//     res.json({
//       text: aiResponseText,
//       conversationId: conversation ? conversation._id : null, 
//     });

//   } catch (error) {
//     console.error('Gemini API/Persistence Error:', error);
    
//     if (error.name === 'ValidationError') {
//         console.error('Mongoose Validation Failed (Corrupt Data):', error.errors);
//         return res.status(500).json({
//              error: 'Database validation failed. Please delete the corrupt chat history and try again.',
//              details: error.message
//         });
//     }

//     res.status(500).json({
//       error: 'Failed to generate response from AI or save history.',
//       details: error.message
//     });
//   }
// };

// backend/controllers/ai.controller.js (FINAL CLEANED VERSION)

const {
  ai,
  systemInstruction,
  model,
  tuning
} = require('../config/gemini.config.js');

// -------------------------------------------------------------------------
// RAG INTEGRATION: Import Mongoose Models
const AnimeData = require('../models/AnimeData');
const Conversation = require('../models/Conversation'); 
const { get_anime_summary, fetch_character_info } = require('../services/animeTools');
// -------------------------------------------------------------------------

// =========================================================================
// 1. TOOL DEFINITIONS (Function Schemas) - CLEANED
// =========================================================================
const customTools = [
  {
    function_declaration: {
      name: 'get_anime_summary',
      description: 'Fetches a detailed summary (plot, studio, episode count, genres) for a specific anime title.',
      parameters: { type: 'OBJECT', properties: { anime_title: { type: 'STRING' } }, required: ['anime_title'] }
    }
  },
  {
    function_declaration: {
      name: 'fetch_character_info',
      description: 'Retrieves detailed information (voice actor, powers, background) about a specific character from a given anime.',
      parameters: { type: 'OBJECT', properties: { anime_title: { type: 'STRING' }, character_name: { type: 'STRING' } }, required: ['anime_title', 'character_name'] }
    }
  },
];

const tools = [
    ...customTools,
    { googleSearch: {} } // Hybrid: Includes Google Search grounding
];


// =========================================================================
// 2. AVAILABLE FUNCTIONS MAP
// =========================================================================
const availableFunctions = {
  get_anime_summary,
  fetch_character_info,
};


// =========================================================================
// 3. MAIN CONTROLLER LOGIC (Final Simplified Logic)
// =========================================================================

exports.generateResponse = async (req, res) => {
  const { userPrompt, conversationId } = req.body; 
  const userId = req.userId || null; 
  
  if (!userPrompt) {
    return res.status(400).json({ error: 'User prompt is required.' });
  }

  let conversation;
  let history = []; 

  try {
    // --- STEP A: HANDLE CONVERSATION RETRIEVAL/CREATION (Persistence) ---
    if (userId) { 
        if (conversationId) {
            conversation = await Conversation.findOne({ _id: conversationId, userId: userId });
            if (conversation) {
                history = conversation.messages.filter(msg => msg.text && msg.sender);
            }
        } 
        if (!conversation) {
            conversation = new Conversation({ userId: userId }); 
        }
    }
    
    const newUserMessage = { sender: 'user', text: userPrompt };

    const contentsForLLM = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));
    let contents = [...contentsForLLM, { role: 'user', parts: [{ text: userPrompt }] }];

    // --- First Call (Includes tools to allow function calling) ---
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
    // --- STEP B: FUNCTION CALLING LOOP (Simplified RAG Check) ---
    // --------------------------------------------------------------------------

    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      const functionName = call.name;
      let functionArgs = call.args;

      if (availableFunctions[functionName]) {
        console.log(`Executing custom tool: ${functionName}`);
        
        const functionResult = await availableFunctions[functionName](functionArgs); 
        
        // --- CRITICAL CHECK: Early Exit if RAG/Tool failed ---
        if (functionResult && functionResult.status === 'error') {
            const friendlyApology = `I'm sorry! I couldn't find the information in my database. The error was: "${functionResult.message}". Can you try a different query?`;
            
            return res.json({ 
                text: friendlyApology,
                conversationId: conversation ? conversation._id : null
            });
        }
        // -------------------------------------------------------------------
        
        // Proceed with second LLM call on tool success
        contents = [
          ...contents,
          { role: 'model', parts: [{ functionCall: call }] },
          { role: 'tool', parts: [{ functionResponse: { name: functionName, response: functionResult } }] },
        ];

        response = await ai.models.generateContent({
          model: model,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: tuning.temperature,
            maxOutputTokens: tuning.maxOutputTokens,
          },
          tools: tools, // Keep tools enabled for subsequent calls
        });
      } else {
        console.error(`Unknown function: ${functionName}`);
      }
    }

    // --- Final Response ---
    const aiResponseText = response.text;
    const newModelMessage = { sender: 'model', text: aiResponseText };
    
    if (conversation && aiResponseText && aiResponseText.length > 0) {
        // Save history
        const userMsgToSave = { sender: newUserMessage.sender, text: newUserMessage.text };
        conversation.messages.push(userMsgToSave);
        conversation.messages.push(newModelMessage);
        
        if (conversation.messages.length <= 2 && conversation.title === 'New Chat') {
            conversation.title = userPrompt.substring(0, 30).trim() + '...';
        }
        
        await conversation.save();
    }


    res.json({
      text: aiResponseText,
      conversationId: conversation ? conversation._id : null, 
    });

  } catch (error) {
    console.error('Gemini API/Persistence Fatal Error:', error); 
    res.status(500).json({
      error: 'Failed to generate response from AI or save history.',
      details: error.message
    });
  }
};