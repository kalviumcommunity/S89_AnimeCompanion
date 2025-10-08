

// // frontend/src/components/ChatWindow.jsx (FINAL, CORRECTED VERSION)
// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; 
// import Cookies from 'js-cookie'; 
// import './ChatWindow.css'; 

// const API_BASE_URL = 'http://localhost:3001/api/ai';

// // Helper function to format date
// const formatChatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//     });
// };


// function ChatWindow() {
//   const { user, isAuthenticated } = useAuth(); // Removed 'token'
  
//   const [history, setHistory] = useState([]); 
//   const [conversationId, setConversationId] = useState(null); 
//   const [conversationList, setConversationList] = useState([]); 
//   const [input, setInput] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
//   const [isListLoading, setIsListLoading] = useState(true); 

//   const messagesEndRef = useRef(null);

//   // --- Core function to fetch history for a specific ID ---
//   const fetchMessages = useCallback(async (id) => {
//       if (!id || !isAuthenticated) return;
      
//       setIsHistoryLoading(true);
//       Cookies.set('last-conversation-id', id, { expires: 7, secure: false, sameSite: 'Lax' });
      
//       try {
//           // Rely on global axios.withCredentials for cookie sending
//           const config = { headers: {} }; 
          
//           const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, config);
          
//           setHistory(response.data.messages);
//           setConversationId(response.data.conversationId);
          
//       } catch (error) {
//           console.error("Error fetching specific conversation:", error.response?.data || error.message);
//           Cookies.remove('last-conversation-id');
//           setConversationId(null);
//           setHistory([]);
//       } finally {
//           setIsHistoryLoading(false);
//       }
//   }, [isAuthenticated]); 


//   // --- 1. CONVERSATION LIST HOOK (Loads all chat summaries on login) ---
//   useEffect(() => {
//     if (!isAuthenticated) {
//         setConversationList([]);
//         setIsListLoading(false);
//         return;
//     }

//     const loadConversationList = async () => {
//         setIsListLoading(true);
//         try {
//             // Rely on global axios.withCredentials for cookie sending
//             const config = { headers: {} };
            
//             const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
            
//             setConversationList(response.data);
            
//             // Auto-load the most recent chat or the one saved in the cookie
//             const lastId = Cookies.get('last-conversation-id');
//             const targetId = lastId && response.data.some(c => c._id === lastId) 
//                                ? lastId
//                                : response.data[0]?._id; 
            
//             if (targetId) {
//                 fetchMessages(targetId);
//             } else {
//                 setHistory([]); 
//             }

//         } catch (error) {
//             console.error("Error loading conversation list:", error.response?.data || error.message);
//             setConversationList([]);
//             setHistory([]);
//         } finally {
//             setIsListLoading(false);
//         }
//     };
    
//     setHistory([]);
//     setConversationId(null);
//     loadConversationList();
    
//   }, [isAuthenticated, fetchMessages]); 


//   // --- New Chat Handler ---
//   const startNewChat = () => {
//       setConversationId(null);
//       setHistory([]);
//       Cookies.remove('last-conversation-id');
//   };
  
//   // Scroll to the bottom whenever history changes
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [history, isHistoryLoading]);
  
  
//   // Handles sending the message to the backend 
//   const handleSend = async (e) => {
//     e.preventDefault();
//     if (!input.trim() || isLoading) return;
    
//     const userPrompt = input.trim();
//     // 1. Optimistic Update (Push user message TEMPORARILY)
//     const newUserMessage = { sender: 'user', text: userPrompt };
//     setHistory(prevHistory => [...prevHistory, newUserMessage]); 
    
//     setInput('');
//     setIsLoading(true);

//     try {
//       // Configuration remains correct (relying on global axios credentials)
//       const config = { 
//           headers: { 
//               'Content-Type': 'application/json' 
//           } 
//       }; 
      
//       const payload = { userPrompt: userPrompt, conversationId: conversationId };

//       const response = await axios.post(`${API_BASE_URL}/chat`, payload, config);
      
//       const aiResponseText = response.data.text;

//       if (response.data.conversationId) {
//           const newId = response.data.conversationId;
//           setConversationId(newId);
//           Cookies.set('last-conversation-id', newId, { expires: 7, secure: false, sameSite: 'Lax' });
          
//           if (!conversationId) {
//              const listResponse = await axios.get(`${API_BASE_URL}/conversations`, {headers: {}}); 
//              setConversationList(listResponse.data);
//           }
//       }

//       const finalAIMessage = { sender: 'model', text: aiResponseText };
      
//       // CRITICAL FIX: Synchronize state by removing the temporary message and adding the final turn.
//       if (finalAIMessage.text && finalAIMessage.text.length > 0) {
//         setHistory(prevHistory => {
//             // Remove the temporary user message added optimistically (the last element)
//             const updatedHistory = prevHistory.slice(0, -1); 
            
//             // Add the final user message (as recorded by the server)
//             updatedHistory.push(newUserMessage);
//             // Add the final AI response
//             updatedHistory.push(finalAIMessage);

//             return updatedHistory;
//         });
//       } else {
//         // Fallback for an empty response (remove user message and reset)
//         setHistory(prevHistory => prevHistory.slice(0, -1));
//         console.warn("Received empty text response from backend, ignoring message.");
//       }


//     } catch (error) {
//       console.error("Error fetching AI response:", error.response?.data || error.message);
//       const errorMessage = { sender: 'model', text: `Error: Sorry, the Anime Companion is currently unavailable. Status: ${error.response?.status || 'Network Error'}` };
      
//       setHistory(prevHistory => {
//           const updatedHistory = [...prevHistory];
//           updatedHistory.pop(); 
//           updatedHistory.push(errorMessage);
//           return updatedHistory;
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };


//   if (isListLoading) {
//       return (
//           <div className="chat-container loading-state">
//               <p>Loading your chat history... 🍥</p>
//           </div>
//       );
//   }

//   return (
//     <div className="main-chat-layout">
//         {/* Sidebar for History List (Only visible if authenticated) */}
//         {isAuthenticated && (
//             <div className="chat-sidebar">
//                 <button onClick={startNewChat} className="new-chat-button">
//                     + New Chat
//                 </button>
//                 <h3>Past Conversations</h3>
//                 {conversationList.length === 0 && <p className='no-chats'>No saved chats yet.</p>}
//                 <div className="conversation-list">
//                     {conversationList.map((conv) => (
//                         <div
//                             key={conv._id}
//                             onClick={() => fetchMessages(conv._id)}
//                             className={`conversation-item ${conv._id === conversationId ? 'active' : ''}`}
//                         >
//                             <p className="title">{conv.title}</p>
//                             <p className="date">{formatChatDate(conv.updatedAt)}</p>
//                         </div>
//                     ))}
//                 </div>
//             </div>
//         )}

//         {/* Main Chat Area */}
//         <div className="chat-container">
//             <div className="chat-messages">
//                 {!isAuthenticated && (
//                     <div className="initial-message">
//                          Login or Sign Up to unlock history and personalized recommendations.
//                     </div>
//                 )}
//                 {isAuthenticated && history.length === 0 && (
//                     <div className="initial-message">
//                         Welcome, {user.username}! Start a new chat or select one from the sidebar.
//                     </div>
//                 )}
                
//                 {isHistoryLoading ? (
//                     <div className="loading-indicator">Loading messages...</div>
//                 ) : (
//                     history.map((message, index) => (
//                         <div 
//                             key={index} 
//                             className={`message-bubble ${message.sender}`}
//                         >
//                             <strong>{message.sender === 'user' ? (isAuthenticated ? `${user.username}:` : 'You:') : 'Anime Companion:'}</strong>
//                             <p>{message.text}</p>
//                         </div>
//                     ))
//                 )}

//                 {isLoading && (
//                     <div className="message-bubble model loading">
//                         <p>Anime Companion is thinking...</p>
//                     </div>
//                 )}
//                 <div ref={messagesEndRef} />
//             </div>

//             <form onSubmit={handleSend} className="chat-input-form">
//                 <input
//                     type="text"
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     placeholder={isLoading ? "Waiting for response..." : "Ask your question..."}
//                     disabled={isLoading}
//                 />
//                 <button type="submit" disabled={isLoading}>
//                     {isLoading ? '⏳' : 'Send'}
//                 </button>
//             </form>
//         </div>
//     </div>
//   );
// }

// export default ChatWindow;

// frontend/src/components/ChatWindow.jsx (FINAL, CORRECTED VERSION)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import Cookies from 'js-cookie'; 
import './ChatWindow.css'; 

const API_BASE_URL = 'http://localhost:3001/api/ai';

// Helper function to format date for the sidebar
const formatChatDate = (dateString) => {
    // Uses short month and day format for sidebar visibility
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
};


function ChatWindow() {
  // Access state/functions from Auth Context
  const { user, isAuthenticated, token } = useAuth(); 
  
  // Chat States
  const [history, setHistory] = useState([]); 
  const [conversationId, setConversationId] = useState(null); 
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sidebar States
  const [conversationList, setConversationList] = useState([]); 
  const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
  const [isListLoading, setIsListLoading] = useState(true); 
  const [hoverId, setHoverId] = useState(null); 

  const messagesEndRef = useRef(null);
  
  // --- Core function to reload the sidebar list and AUTO-LOAD ---
  const loadConversationList = useCallback(async () => {
    if (!isAuthenticated) {
        setConversationList([]);
        setIsListLoading(false);
        return;
    }
    
    setIsListLoading(true);
    try {
        const config = { headers: {} }; 
        const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
        
        setConversationList(response.data);
        
        // --- CRITICAL FIX: Load the last active chat saved in the cookie ---
        const lastId = Cookies.get('last-conversation-id');
        
        // If a valid ID is in the cookie, load *that* chat. Otherwise, targetId is null/undefined.
        const targetId = lastId && response.data.some(c => c._id === lastId) 
                           ? lastId
                           : null; // <-- DO NOT default to response.data[0]._id
        
        if (targetId) {
            // Load the chat tied to the cookie
            const historyResponse = await axios.get(`${API_BASE_URL}/conversations/${targetId}`, config);
            setHistory(historyResponse.data.messages);
            setConversationId(targetId);
        } else {
            // If no valid cookie ID, start a blank session
            setHistory([]); 
            setConversationId(null);
        }

    } catch (error) {
        console.error("Error loading conversation list:", error.response?.data || error.message);
        setConversationList([]);
        setHistory([]);
    } finally {
        setIsListLoading(false);
    }
  }, [isAuthenticated]); 


  // --- Core function to fetch history for a specific ID (for selection) ---
  const fetchMessages = useCallback(async (id) => {
      if (!id || !isAuthenticated) return;
      
      setIsHistoryLoading(true);
      // Persist the selected ID
      Cookies.set('last-conversation-id', id, { expires: 7, secure: false, sameSite: 'Lax' });
      
      try {
          const config = { headers: {} }; 
          const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, config);
          
          setHistory(response.data.messages);
          setConversationId(response.data.conversationId);
          
      } catch (error) {
          console.error("Error fetching specific conversation:", error.response?.data || error.message);
          Cookies.remove('last-conversation-id');
          setConversationId(null);
          setHistory([]);
      } finally {
          setIsHistoryLoading(false);
      }
  }, [isAuthenticated]); 


  // --- New Chat Handler ---
  const startNewChat = () => {
      // CRITICAL FIX: The key to "New Chat" is clearing the persistent ID first
      Cookies.remove('last-conversation-id');
      setConversationId(null);
      setHistory([]);
      
      // We don't need to call loadConversationList() immediately, 
      // but reloading the list makes the sidebar update cleanly.
      loadConversationList(); 
  };


  // --- Delete Conversation Handler (Text Button Impl) ---
  const deleteConversation = async (id, e) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;

    try {
        await axios.delete(`${API_BASE_URL}/conversations/${id}`, {
            withCredentials: true,
            headers: { 'Authorization': `Bearer ${token}` }
        });

        setConversationList(prev => prev.filter(c => c._id !== id));
        
        // If the deleted chat was the active one, start a new chat session
        if (id === conversationId) {
            startNewChat(); 
        }

    } catch (error) {
        console.error("Deletion failed:", error.response?.data || error.message);
        alert("Failed to delete conversation. Check console for 401/404.");
    }
  };


  // --- PRIMARY EFFECT HOOK (Loads sidebar list on mount/login) ---
  useEffect(() => {
    loadConversationList();
  }, [isAuthenticated, loadConversationList]); 


  // Scroll to the bottom whenever history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, isHistoryLoading]);
  
  
  // Handles sending the message to the backend 
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userPrompt = input.trim();
    const newUserMessage = { sender: 'user', text: userPrompt };
    setHistory(prevHistory => [...prevHistory, newUserMessage]); 
    
    setInput('');
    setIsLoading(true);

    try {
      const config = { headers: { 'Content-Type': 'application/json' } }; 
      
      const payload = { userPrompt: userPrompt, conversationId: conversationId };

      const response = await axios.post(`${API_BASE_URL}/chat`, payload, config);
      
      const aiResponseText = response.data.text;
      const newId = response.data.conversationId;

      if (newId) {
          setConversationId(newId);
          Cookies.set('last-conversation-id', newId, { expires: 7, secure: false, sameSite: 'Lax' });
          
          if (!conversationId) {
             loadConversationList(); 
          }
      }

      const finalAIMessage = { sender: 'model', text: aiResponseText };
      
      if (finalAIMessage.text && finalAIMessage.text.length > 0) {
        setHistory(prevHistory => {
            const updatedHistory = prevHistory.slice(0, -1); 
            updatedHistory.push(newUserMessage);
            updatedHistory.push(finalAIMessage);
            return updatedHistory;
        });
      } else {
        setHistory(prevHistory => prevHistory.slice(0, -1));
        alert("Error: Received empty text response from the AI.");
      }

    } catch (error) {
      console.error("Error fetching AI response:", error.response?.data || error.message);
      const errorMessage = { sender: 'model', text: `Error: The Companion is unavailable. Status: ${error.response?.status || 'Network Error'}` };
      
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


  if (isListLoading) {
      return (
          <div className="main-chat-layout loading-state">
              <p>Loading your chat history... 🍥</p>
          </div>
      );
  }

  return (
    <div className="main-chat-layout">
        {/* Sidebar for History List */}
        {isAuthenticated && (
            <div className="chat-sidebar">
                <button onClick={startNewChat} className="new-chat-button">
                    New Chat
                </button>
                <h3>Past Conversations</h3>
                {conversationList.length === 0 && <p className='no-chats'>No saved chats yet.</p>}
                
                <div className="conversation-list">
                    {conversationList.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => fetchMessages(conv._id)}
                            onMouseEnter={() => setHoverId(conv._id)}
                            onMouseLeave={() => setHoverId(null)}
                            className={`conversation-item ${conv._id === conversationId ? 'active' : ''}`}
                        >
                            <span className="chat-date">{formatChatDate(conv.updatedAt)}</span>
                            <p className="title">{conv.title}</p>
                            
                            {/* Delete Button (Visible on hover as text) */}
                            {hoverId === conv._id && (
                                <button 
                                    className="delete-button text-only" 
                                    onClick={(e) => deleteConversation(conv._id, e)} 
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Main Chat Area */}
        <div className="chat-container">
            <div className="chat-messages">
                {!isAuthenticated && (
                    <div className="initial-message">
                         Login or Sign Up to unlock history and personalized recommendations.
                    </div>
                )}
                {isAuthenticated && history.length === 0 && (
                    <div className="initial-message">
                        Welcome, {user.username}! Start a new chat or select one from the sidebar.
                    </div>
                )}
                
                {isHistoryLoading ? (
                    <div className="loading-indicator">Loading messages...</div>
                ) : (
                    history.map((message, index) => (
                        <div 
                            key={index} 
                            className={`message-bubble ${message.sender}`}
                        >
                            <strong>{message.sender === 'user' ? (isAuthenticated ? `${user.username}:` : 'You:') : 'Anime Companion:'}</strong>
                            <p>{message.text}</p>
                        </div>
                    ))
                )}

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
    </div>
  );
}

export default ChatWindow;