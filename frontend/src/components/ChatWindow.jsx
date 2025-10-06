// // frontend/src/components/ChatWindow.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import './ChatWindow.css'; // We'll define simple styles below

// const API_BASE_URL = 'http://localhost:3001/api/ai/chat';

// function ChatWindow() {
//   // State for the conversation history
//   const [history, setHistory] = useState([]); 
//   // State for the current user input
//   const [input, setInput] = useState('');
//   // State to disable input while waiting for AI response
//   const [isLoading, setIsLoading] = useState(false);

//   // Ref to automatically scroll to the latest message
//   const messagesEndRef = useRef(null);

//   // Scroll to the bottom of the chat window whenever history changes
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [history]);


//   // Handles sending the message to the backend
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     const userPrompt = input.trim();
//     // 1. Add user message to history immediately
//     const newUserMessage = { sender: 'user', text: userPrompt };
    
//     // Convert history to the format required by the backend
//     const conversationHistory = [...history, newUserMessage];
//     setHistory(conversationHistory); 
    
//     setInput('');
//     setIsLoading(true);

//     try {
//       // 2. Make the API call to your Express backend
//       const response = await axios.post(API_BASE_URL, {
//         userPrompt: userPrompt,
//         // Send the entire current history so the AI has context
//         conversationHistory: history, 
//       });

//       // 3. Add AI response to history
//       const aiMessage = { 
//         sender: 'model', 
//         text: response.data.text 
//       };
      
//       setHistory(prevHistory => [...prevHistory, aiMessage]);

//     } catch (error) {
//       console.error("Error fetching AI response:", error);
//       const errorMessage = { 
//         sender: 'model', 
//         text: "Error: Sorry, the Anime Companion is currently unavailable. Check the backend server." 
//       };
//       setHistory(prevHistory => [...prevHistory, errorMessage]);

//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-messages">
//         {history.length === 0 && (
//             <div className="initial-message">
//                 Welcome! Ask me a question about your favorite anime!
//             </div>
//         )}
//         {history.map((message, index) => (
//           <div 
//             key={index} 
//             className={`message-bubble ${message.sender}`}
//           >
//             <strong>{message.sender === 'user' ? 'You:' : 'Anime Companion:'}</strong>
//             <p>{message.text}</p>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="message-bubble model loading">
//             <p>Anime Companion is thinking...</p>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSend} className="chat-input-form">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder={isLoading ? "Waiting for response..." : "Ask your question..."}
//           disabled={isLoading}
//         />
//         <button type="submit" disabled={isLoading}>
//           {isLoading ? '⏳' : 'Send'}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default ChatWindow;


// // frontend/src/components/ChatWindow.jsx
// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; // <--- NEW IMPORT
// import './ChatWindow.css'; 

// const API_BASE_URL = 'http://localhost:3001/api/ai/chat';

// function ChatWindow() {
//   const { token, user, isAuthenticated } = useAuth(); // <--- ACCESS TOKEN, USER, and AUTH STATUS
  
//   // State for the conversation history
//   const [history, setHistory] = useState([]); 
//   // State for the current user input
//   const [input, setInput] = useState('');
//   // State to disable input while waiting for AI response
//   const [isLoading, setIsLoading] = useState(false);

//   // Ref to automatically scroll to the latest message
//   const messagesEndRef = useRef(null);

//   // Scroll to the bottom of the chat window whenever history changes
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [history]);


//   // Handles sending the message to the backend
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;

//     const userPrompt = input.trim();
//     // 1. Add user message to history immediately
//     const newUserMessage = { sender: 'user', text: userPrompt };
    
//     // Convert history to the format required by the backend
//     const conversationHistory = [...history, newUserMessage];
//     setHistory(conversationHistory); 
    
//     setInput('');
//     setIsLoading(true);

//     try {
//       // Configure headers to include the JWT token if available
//       const config = {
//           headers: {
//               // Attach the token in the Authorization header (Bearer scheme)
//               'Authorization': token ? `Bearer ${token}` : '', 
//               'Content-Type': 'application/json'
//           }
//       };
      
//       // 2. Make the API call to your Express backend
//       const response = await axios.post(API_BASE_URL, {
//         userPrompt: userPrompt,
//         // Send the entire current history so the AI has context
//         conversationHistory: history, 
//       }, config); // <--- PASS THE CONFIG OBJECT WITH THE TOKEN

//       // 3. Add AI response to history
//       const aiMessage = { 
//         sender: 'model', 
//         text: response.data.text 
//       };
      
//       setHistory(prevHistory => [...prevHistory, aiMessage]);

//     } catch (error) {
//       console.error("Error fetching AI response:", error.response?.data || error.message);
//       const errorMessage = { 
//         sender: 'model', 
//         text: `Error: Sorry, the Anime Companion is currently unavailable. Status: ${error.response?.status || 'Network Error'}` 
//       };
//       setHistory(prevHistory => [...prevHistory, errorMessage]);

//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chat-container">
//       <div className="chat-messages">
//         {history.length === 0 && (
//             <div className="initial-message">
//                 Welcome! {isAuthenticated ? `Logged in as ${user.username}. Ask for a personalized recommendation!` : 'Login to unlock personalized recommendations.'}
//             </div>
//         )}
//         {history.map((message, index) => (
//           <div 
//             key={index} 
//             className={`message-bubble ${message.sender}`}
//           >
//             <strong>{message.sender === 'user' ? (isAuthenticated ? `${user.username}:` : 'You:') : 'Anime Companion:'}</strong>
//             <p>{message.text}</p>
//           </div>
//         ))}

//         {isLoading && (
//           <div className="message-bubble model loading">
//             <p>Anime Companion is thinking...</p>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSend} className="chat-input-form">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder={isLoading ? "Waiting for response..." : "Ask your question..."}
//           disabled={isLoading}
//         />
//         <button type="submit" disabled={isLoading}>
//           {isLoading ? '⏳' : 'Send'}
//         </button>
//       </form>
//     </div>
//   );
// }

// export default ChatWindow;
// frontend/src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import Cookies from 'js-cookie'; // <--- Import Cookies to persist chat ID
import './ChatWindow.css'; 

const API_BASE_URL = 'http://localhost:3001/api/ai';

function ChatWindow() {
  const { token, user, isAuthenticated } = useAuth(); 
  
  const [history, setHistory] = useState([]); 
  const [conversationId, setConversationId] = useState(null); 
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true); // <--- NEW STATE for initial load

  const messagesEndRef = useRef(null);

  // --- 1. HISTORY LOADING HOOK ---
  useEffect(() => {
    const loadHistory = async () => {
        // Stop if not authenticated or if history is already loaded
        if (!isAuthenticated) {
            setIsHistoryLoading(false);
            return;
        }

        const lastConversationId = Cookies.get('last-conversation-id');
        
        if (!lastConversationId) {
            setIsHistoryLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`, 
                }
            };
            // Fetch history using the new GET route
            const response = await axios.get(`${API_BASE_URL}/history/${lastConversationId}`, config);
            
            // Set history state and update conversationId
            setHistory(response.data.messages);
            setConversationId(response.data.conversationId);
            console.log(`History loaded for conversation: ${response.data.conversationId}`);

        } catch (error) {
            console.error("Error loading conversation history:", error.response?.data || error.message);
            // If fetching old history fails (e.g., ID expired/invalid), just start a new chat
            Cookies.remove('last-conversation-id');
            setConversationId(null); 
            setHistory([]);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    // Reset and load history when the authentication status changes (login/logout)
    setHistory([]);
    setConversationId(null);
    loadHistory();
  }, [isAuthenticated, token]); // Rerun when user logs in/out

  // Scroll to the bottom whenever history changes or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isHistoryLoading]);
  
  // --- END HISTORY LOADING HOOK ---


  // Handles sending the message to the backend
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    
    // 1. Optimistic update for user message
    const newUserMessage = { sender: 'user', text: userPrompt };
    setHistory(prevHistory => [...prevHistory, newUserMessage]); 
    
    setInput('');
    setIsLoading(true);

    try {
      // Configure headers to include the JWT token
      const config = {
          headers: {
              'Authorization': token ? `Bearer ${token}` : '', 
              'Content-Type': 'application/json'
          }
      };
      
      // 2. Prepare the data payload
      const payload = {
        userPrompt: userPrompt,
        conversationId: conversationId, // <--- SEND CURRENT ID
      };

      // 3. Make the API call to your Express backend
      const response = await axios.post(`${API_BASE_URL}/chat`, payload, config); // <--- Use /chat endpoint

      // 4. Update the conversation ID in state AND save to cookie for persistence
      if (response.data.conversationId) {
          setConversationId(response.data.conversationId);
          Cookies.set('last-conversation-id', response.data.conversationId, { expires: 7, secure: false, sameSite: 'Lax' });
      }

      // 5. Add AI response to history
      const aiMessage = { 
        sender: 'model', 
        text: response.data.text 
      };
      
      setHistory(prevHistory => [...prevHistory, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error.response?.data || error.message);
      const errorMessage = { 
        sender: 'model', 
        text: `Error: Sorry, the Anime Companion is currently unavailable. Status: ${error.response?.status || 'Network Error'}` 
      };
      
      // Remove the optimistic user message and append error
      setHistory(prevHistory => {
          const updatedHistory = [...prevHistory];
          updatedHistory.pop(); 
          updatedHistory.push(errorMessage);
          return updatedHistory;
      });

    } finally {
      setIsLoading(false);
    }
  };
  
  // Display loading state while trying to fetch past messages
  if (isHistoryLoading) {
      return (
          <div className="chat-container loading-state">
              <p>Loading conversation history... 🍥</p>
          </div>
      );
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {history.length === 0 && (
            <div className="initial-message">
                Welcome! {isAuthenticated ? 
                    `Logged in as ${user.username}. Let's chat! (ID: ${conversationId ? 'Active' : 'New'})` 
                    : 
                    'Login or Sign Up to unlock history and personalized recommendations.'
                }
            </div>
        )}
        {history.map((message, index) => (
          <div 
            key={index} 
            className={`message-bubble ${message.sender}`}
          >
            <strong>{message.sender === 'user' ? (isAuthenticated ? `${user.username}:` : 'You:') : 'Anime Companion:'}</strong>
            <p>{message.text}</p>
          </div>
        ))}

        {isLoading && (
          <div className="message-bubble model loading">
            <p>Anime Companion is thinking...</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Waiting for response..." : "Ask your question..."}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '⏳' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;