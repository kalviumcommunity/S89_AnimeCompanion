// // frontend/src/components/ChatWindow.jsx (FINAL VERSION: Fixed race condition with shouldRefreshList state)

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext'; 
// import Cookies from 'js-cookie'; 
// import ReactMarkdown from 'react-markdown'; 
// import rehypeRaw from 'rehype-raw';       
// import './ChatWindow.css'; 
// import Sidebar from './Sidebar';

// // Constants for UI
// const API_BASE_URL = 'https://tsd-animecompanion.onrender.com/api/ai';
// const TYPING_SPEED_MS = 18; // ms per character for streaming

// // Helper component for a simple loading animation
// const ThinkingIndicator = () => (
//     <div className="message-text model-text loading-dots">
//         <span></span><span></span><span></span>
//     </div>
// );

// function ChatWindow({ sidebarOpen: sidebarOpenProp = true, setSidebarOpen: setSidebarOpenProp = () => {} }) {
//     const { user, isAuthenticated } = useAuth(); 
//     // const { token } = useAuth(); 
  
//     // Chat States
//     const [history, setHistory] = useState([]); 
//     const [conversationId, setConversationId] = useState(null); 
//     const [input, setInput] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
    
//     // NEW: State flag to control when the sidebar list should be reloaded
//     const [shouldRefreshList, setShouldRefreshList] = useState(false); 

//     // Sidebar States
//     const [conversationList, setConversationList] = useState([]); 
//     const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
//     const [isListLoading, setIsListLoading] = useState(true); 
//     const [hoverId, setHoverId] = useState(null); 

//     const messagesEndRef = useRef(null);
//     const streamingTimersRef = useRef([]);

//     // Use lifted sidebar state when provided, otherwise use a local default 
//     const [localSidebarOpen] = useState(true);
//     const sidebarOpen = typeof sidebarOpenProp === 'boolean' ? sidebarOpenProp : localSidebarOpen;
//     const setSidebarOpen = typeof setSidebarOpenProp === 'function' ? setSidebarOpenProp : () => {};

//     // Helper: remove spaces before punctuation so commas/periods don't float to next line
//     const sanitizeText = (text) => {
//         if (!text || typeof text !== 'string') return text;
//         let s = text;
//         s = s.replace(/\s+([,.;:!?])/g, '$1');
//         s = s.replace(/\n+\s*([,.;:!?])/g, '$1');
//         s = s.replace(/\n{1,}\s*([,.;:!?])\s*/g, '$1 ');
//         s = s.replace(/\n{3,}/g, '\n\n');
//         return s.trim();
//     };

//     const sanitizeMessages = (messages) => {
//         if (!Array.isArray(messages)) return [];
//         return messages.map(m => ({ ...m, text: typeof m.text === 'string' ? sanitizeText(m.text) : m.text }));
//     };
    
//     // --- Helper function to only fetch and set the conversation list ---
//     const reloadSidebarList = useCallback(async () => {
//         if (!isAuthenticated) {
//             setConversationList([]);
//             return;
//         }
//         try {
//             const config = { withCredentials: true }; 
//             const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
//             setConversationList(response.data);
//         } catch (error) {
//             console.error("Error reloading conversation list:", error.response?.data || error.message);
//             setConversationList([]);
//         }
//     }, [isAuthenticated]); 


//     // --- Core function to reload the sidebar list and AUTO-LOAD (Used for initial mount) ---
//     const loadConversationList = useCallback(async (shouldAutoLoad = true) => {
//         if (!isAuthenticated) {
//             setConversationList([]);
//             setIsListLoading(false);
//             return;
//         }
        
//         setIsListLoading(true);
//         try {
//             const config = { withCredentials: true }; 
//             const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
            
//             setConversationList(response.data);
            
//             if (shouldAutoLoad) { 
//                 // Auto-load logic
//                 const lastId = Cookies.get('last-conversation-id');
//                 const targetId = lastId && response.data.some(c => c._id === lastId) 
//                                 ? lastId
//                                 : response.data.length > 0 ? response.data[0]._id : null; 

                
//                 if (targetId) {
//                     const historyResponse = await axios.get(`${API_BASE_URL}/conversations/${targetId}`, config);
//                     setHistory(sanitizeMessages(historyResponse.data.messages));
//                     setConversationId(targetId);
//                 } else {
//                     setHistory([]); 
//                     setConversationId(null);
//                 }
//             } 

//         } catch (error) {
//             console.error("Error loading conversation list:", error.response?.data || error.message);
//             setConversationList([]);
//             setHistory([]);
//         } finally {
//             setIsListLoading(false);
//         }
//     }, [isAuthenticated]); 


//     // --- Core function to fetch history for a specific ID (for selection) ---
//     const fetchMessages = useCallback(async (id) => {
//         if (!id || !isAuthenticated) return;
//         // clear any streaming timers and stop existing streams before switching
//         streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
//         streamingTimersRef.current = [];

//         setIsHistoryLoading(true);
//         Cookies.set('last-conversation-id', id, { expires: 7, secure: false, sameSite: 'Lax' });
        
//         try {
//             const config = { withCredentials: true }; 
//             const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, config);
            
//             setHistory(sanitizeMessages(response.data.messages));
//             setConversationId(response.data.conversationId);
            
//         } catch (error) {
//             console.error("Error fetching specific conversation:", error.response?.data || error.message);
//             Cookies.remove('last-conversation-id');
//             setConversationId(null);
//             setHistory([]);
//         } finally {
//             setIsHistoryLoading(false);
//         }
//     }, [isAuthenticated]); 


//     // --- New Chat Handler ---
//     const startNewChat = () => {
//         // 1. Clear state locally first
//         Cookies.remove('last-conversation-id');
//         setConversationId(null);
//         setHistory([]);
//         setShouldRefreshList(false); // Ensure this is false on a new chat start
//         // clear any streaming timers and stop active streams
//         streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
//         streamingTimersRef.current = [];
        
//         // 2. Only fetch the list, do NOT auto-load history
//         reloadSidebarList(); 
//     };


//     // --- Delete Conversation Handler ---
//     const deleteConversation = async (id, e) => {
//         e.stopPropagation(); 
//         if (!window.confirm("Are you sure you want to delete this conversation?")) return;

//         try {
//             await axios.delete(`${API_BASE_URL}/conversations/${id}`, {
//                 withCredentials: true,
//             });

//             setConversationList(prev => prev.filter(c => c._id !== id));
            
//             if (id === conversationId) {
//                 startNewChat(); 
//             }

//         } catch (error) {
//             console.error("Deletion failed:", error.response?.data || error.message);
//             alert("Failed to delete conversation. Check console for 401/404.");
//         }
//     };


//     // --- PRIMARY EFFECT HOOK (Loads sidebar list on mount/login) ---
//     useEffect(() => {
//         loadConversationList(); 
//     }, [isAuthenticated, loadConversationList]); 
    
    
//     // --- SECONDARY EFFECT HOOK (Updates sidebar list when a new conversation ID is ready) ---
//     // This hook guarantees the sidebar list is reloaded *after* the streaming finishes (isLoading=false)
//     useEffect(() => {
//         // Only run if the flag is set AND the component is NOT currently streaming/loading
//         if (shouldRefreshList && !isLoading) {
//             reloadSidebarList();
//             setShouldRefreshList(false); // Reset the flag immediately after triggering the reload
//         }
//     }, [shouldRefreshList, isLoading, reloadSidebarList]);


//     // Scroll to the bottom whenever history changes
//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [history, isHistoryLoading]);

//     // Clean up any streaming timers on unmount
//     useEffect(() => {
//         return () => {
//                 streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
//                 streamingTimersRef.current = [];
//         };
//     }, []);
    
    
//     // Handles sending the message to the backend 
//     const handleSend = async (e) => {
//         e.preventDefault();
//         if (!input.trim() || isLoading) return;
        
//         const userPrompt = input.trim();
//         const newUserMessage = { sender: 'user', text: userPrompt };
//         const streamId = `stream-${Date.now()}`;
//         // Placeholder now includes a temporary property to ensure it's treated as a pending stream
//         const placeholder = { sender: 'model', text: '', _streamId: streamId, isStreaming: true }; 

//         // Append user message and placeholder in one atomic update
//         let placeholderIndex = null;
//         setHistory(prev => {
//             const next = [...prev, newUserMessage, placeholder];
//             placeholderIndex = next.length - 1;
//             return next;
//         });
//         setInput('');
//         setIsLoading(true);

//         try {
//             const config = { withCredentials: true }; 
            
//             const payload = { userPrompt: userPrompt, conversationId: conversationId };

//             const response = await axios.post(`${API_BASE_URL}/chat`, payload, config);
            
//             const aiResponseText = response.data.text;
//             const newId = response.data.conversationId;

//             // CRITICAL: Set conversation ID and cookie.
//             if (newId && newId !== conversationId) {
//                 setConversationId(newId);
//                 Cookies.set('last-conversation-id', newId, { expires: 7, secure: false, sameSite: 'Lax' });
                
//                 // If it was a new chat, flag that the list needs to be refreshed 
//                 // (The useEffect watching shouldRefreshList will handle the actual fetch)
//                 if (!conversationId) {
//                     setShouldRefreshList(true); 
//                 }
//             }

//             const finalAIMessageText = aiResponseText || '';

//             // --- Streaming Logic ---
//             let cursor = 0;

//             if (finalAIMessageText.length === 0) {
//                 // nothing to stream — replace placeholder with an error message
//                 setHistory(prev => prev.map(m => (m._streamId === streamId ? { sender: 'model', text: 'Error: Empty response from AI.', isStreaming: false } : m)));
//                 setIsLoading(false);
//             } else {
                
//                 const timer = setInterval(() => {
//                     cursor += 1;
//                     const chunk = finalAIMessageText.slice(0, cursor);

//                     setHistory(prev => {
//                         // Locate the placeholder message
//                         const index = prev.findIndex(m => m && m._streamId === streamId);
//                         if (index === -1) {
//                             clearInterval(timer); // stop if placeholder is missing
//                             return prev;
//                         }
                        
//                         const copy = prev.slice();
//                         copy[index] = { ...copy[index], text: sanitizeText(chunk) };
//                         return copy;
//                     });

//                     if (cursor >= finalAIMessageText.length) {
//                         clearInterval(timer);
                        
//                         // Finalize the message (remove isStreaming/streamId properties)
//                         setHistory(prev => {
//                             const index = prev.findIndex(m => m && m._streamId === streamId);
//                             if (index === -1) return prev;

//                             const copy = prev.slice();
//                             copy[index] = { sender: 'model', text: sanitizeText(finalAIMessageText), isStreaming: false };
//                             return copy;
//                         });
                        
//                         streamingTimersRef.current = streamingTimersRef.current.filter(t => t.timer !== timer);
//                         setIsLoading(false);
//                     }
//                 }, TYPING_SPEED_MS);

//                 streamingTimersRef.current.push({ id: streamId, timer });
//             }

//         } catch (error) {
//             console.error("Error fetching AI response:", error.response?.data || error.message);
//             const errorMessage = { sender: 'model', text: `Error: The Companion is unavailable. Status: ${error.response?.status || 'Network Error'}`, isStreaming: false };
            
//             // Replace any placeholder for this stream with the error message
//             setHistory(prevHistory => prevHistory.map(m => (m._streamId === streamId ? errorMessage : m)));
//             setIsLoading(false); // Ensure loading is turned off on error
//         }
//     };


//     if (isListLoading) {
//         return (
//             <div className="main-chat-layout loading-screen">
//                 <p>Loading your chat history... 🍥</p>
//             </div>
//         );
//     }

//     // --- RENDER START ---
//     return (
//     <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        
//         {/* Sidebar - for history list and new chat button */}
//         {isAuthenticated && (
//             <Sidebar
//                 conversationList={conversationList}
//                 fetchMessages={fetchMessages}
//                 startNewChat={startNewChat}
//                 deleteConversation={deleteConversation}
//                 conversationId={conversationId}
//                 hoverId={hoverId}
//                 setHoverId={setHoverId}
//                 sidebarOpen={sidebarOpen}
//                 setSidebarOpen={setSidebarOpen}
//             />
//         )}

//         {/* Main Chat Area - takes up remaining space */}
//         <main className="chat-main-content">
            
//             {/* Message Display Area */}
//             <div className="messages-display-area">
                
//                 {/* Initial/Empty States */}
//                 {!isAuthenticated && (
//                     <div className="initial-message-screen">
//                         <div className="initial-message-content">
//                             <h1>Welcome to Anime Companion!</h1>
//                             <p>Login or Sign Up to unlock history and personalized recommendations.</p>
//                         </div>
//                     </div>
//                 )}
//                 {isAuthenticated && history.length === 0 && (
//                     <div className="initial-message-screen">
//                         <div className="initial-message-content">
//                             <h1>Welcome, {user.username}!</h1>
//                             <p>Ask me anything about your favorite anime, manga, or characters to get started.</p>
//                             <p>Start a new chat or select one from the sidebar.</p>
//                         </div>
//                     </div>
//                 )}

//                 {/* Loading Indicator for History Fetch */}
//                 {isHistoryLoading ? (
//                     <div className="initial-message-screen">
//                         <div className="initial-message-content">
//                             <div className="loading-spinner"></div>
//                             <p>Loading messages...</p>
//                         </div>
//                     </div>
//                 ) : (
//                     // Actual Messages
//                     (history || []).map((message, index) => {
//                         const isUser = message.sender === 'user';
//                         // Check if it's the model's placeholder/streaming message
//                         const isStreaming = message.isStreaming || message._streamId;

//                         return (
//                             <div 
//                                 key={index} 
//                                 className={`message-row ${isUser ? 'user-row' : 'model-row'}`}
//                             >
//                                 <div className="message-icon">
//                                     {isUser ? '👤' : '🤖'} {/* User/Model icons */}
//                                 </div>
//                                 <div className="message-content">
//                                     <div className="message-meta">
//                                         <strong>{isUser ? (isAuthenticated ? `${user.username}` : 'You') : 'Anime Companion'}</strong>
//                                     </div>
//                                     <div className={`message-text ${isUser ? 'user-text' : 'model-text'}`}>
//                                         {isStreaming && message.text.length === 0 ? (
//                                             <ThinkingIndicator />
//                                         ) : (
//                                             <ReactMarkdown 
//                                                 children={message.text}
//                                                 rehypePlugins={[rehypeRaw]}
//                                             />
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })
//                 )}

//                 {/* Scroll Anchor */}
//                 <div ref={messagesEndRef} className="scroll-anchor" />
//             </div>

//             {/* Input Form - Fixed at the bottom */}
//             <div className="chat-input-area-wrapper">
//                 <form onSubmit={handleSend} className="chat-input-form">
//                     <input
//                         type="text"
//                         value={input}
//                         onChange={(e) => setInput(e.target.value)}
//                         placeholder={isLoading ? "Waiting for Companion..." : "Message Anime Companion..."}
//                         disabled={isLoading}
//                         rows="1" 
//                     />
//                     <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
//                         {isLoading ? (
//                             <div className="send-spinner"></div> // Use a smaller spinner for the send button
//                         ) : (
//                             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2.929 3.018l18.5 8.995a.498.498 0 0 1 .002.978l-18.5 9.005c-.32.155-.724-.108-.71-.47L3 17c.01-.271.196-.5.45-.5h13.05a.5.5 0 0 0 0-1H3.45c-.254 0-.44-.229-.45-.5l-.01-4.008c-.01-.271.196-.5.45-.5h13.05a.5.5 0 0 0 0-1H3.45c-.254 0-.44-.229-.45-.5L2.22 3.49c-.014-.361.39-.625.709-.472z" fill="currentColor"></path></svg>
//                         )}
//                     </button>
//                 </form>
               
//             </div>

//         </main>
//     </div>
//     );
// }

// export default ChatWindow;

// frontend/src/components/ChatWindow.jsx (FINAL VERSION: Fixes New Chat inability to type)

import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react'; 
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import Cookies from 'js-cookie'; 
import ReactMarkdown from 'react-markdown'; 
import rehypeRaw from 'rehype-raw';       
import './ChatWindow.css'; 
import Sidebar from './Sidebar';

// Constants for UI
const API_BASE_URL = 'https://tsd-animecompanion.onrender.com/api/ai';
const TYPING_SPEED_MS = 18; // ms per character for streaming

// Helper component for a simple loading animation
const ThinkingIndicator = () => (
    <div className="message-text model-text loading-dots">
        <span></span><span></span><span></span>
    </div>
);

// --- Custom Hook for Auto-resizing Textarea ---
const useAutosizeTextArea = (textareaRef, value) => {
    useLayoutEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [textareaRef, value]);
};
// ----------------------------------------------------


function ChatWindow({ sidebarOpen: sidebarOpenProp = true, setSidebarOpen: setSidebarOpenProp = () => {} }) {
    const { user, isAuthenticated } = useAuth(); 
  
    // Chat States
    const [history, setHistory] = useState([]); 
    const [conversationId, setConversationId] = useState(null); 
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false); 
    const [shouldRefreshList, setShouldRefreshList] = useState(false); 

    // Sidebar States
    const [conversationList, setConversationList] = useState([]); 
    const [isHistoryLoading, setIsHistoryLoading] = useState(false); 
    const [isListLoading, setIsListLoading] = useState(true); 
    const [hoverId, setHoverId] = useState(null); 

    const messagesEndRef = useRef(null);
    const streamingTimersRef = useRef([]);
    
    // TEXTAREA REF
    const textareaRef = useRef(null); 

    // CALL NEW HOOK
    useAutosizeTextArea(textareaRef, input); 

    // Use lifted sidebar state when provided, otherwise use a local default 
    const [localSidebarOpen] = useState(true);
    const sidebarOpen = typeof sidebarOpenProp === 'boolean' ? sidebarOpenProp : localSidebarOpen;
    const setSidebarOpen = typeof setSidebarOpenProp === 'function' ? setSidebarOpenProp : () => {};

    // Helper: remove spaces before punctuation so commas/periods don't float to next line
    const sanitizeText = (text) => {
        if (!text || typeof text !== 'string') return text;
        let s = text;
        s = s.replace(/\s+([,.;:!?])/g, '$1');
        s = s.replace(/\n+\s*([,.;:!?])/g, '$1');
        s = s.replace(/\n{1,}\s*([,.;:!?])\s*/g, '$1 ');
        s = s.replace(/\n{3,}/g, '\n\n');
        return s.trim();
    };

    const sanitizeMessages = (messages) => {
        if (!ArrayOfMessages(messages)) return [];
        return messages.map(m => ({ ...m, text: typeof m.text === 'string' ? sanitizeText(m.text) : m.text }));
    };
    
    // --- Helper function to only fetch and set the conversation list ---
    const reloadSidebarList = useCallback(async () => {
        if (!isAuthenticated) {
            setConversationList([]);
            return;
        }
        try {
            const config = { withCredentials: true }; 
            const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
            setConversationList(response.data);
        } catch (error) {
            console.error("Error reloading conversation list:", error.response?.data || error.message);
            setConversationList([]);
        }
    }, [isAuthenticated]); 


    // --- Core function to reload the sidebar list and AUTO-LOAD (Used for initial mount) ---
    const loadConversationList = useCallback(async (shouldAutoLoad = true) => {
        if (!isAuthenticated) {
            setConversationList([]);
            setIsListLoading(false);
            return;
        }
        
        setIsListLoading(true);
        try {
            const config = { withCredentials: true }; 
            const response = await axios.get(`${API_BASE_URL}/conversations`, config); 
            
            setConversationList(response.data);
            
            if (shouldAutoLoad) { 
                // Auto-load logic
                const lastId = Cookies.get('last-conversation-id');
                const targetId = lastId && response.data.some(c => c._id === lastId) 
                                ? lastId
                                : response.data.length > 0 ? response.data[0]._id : null; 

                
                if (targetId) {
                    const historyResponse = await axios.get(`${API_BASE_URL}/conversations/${targetId}`, config);
                    setHistory(sanitizeMessages(historyResponse.data.messages));
                    setConversationId(targetId);
                } else {
                    setHistory([]); 
                    setConversationId(null);
                }
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
        // clear any streaming timers and stop existing streams before switching
        streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
        streamingTimersRef.current = [];
        setIsLoading(false); // Ensure input is enabled when switching chats

        setIsHistoryLoading(true);
        Cookies.set('last-conversation-id', id, { expires: 7, secure: false, sameSite: 'Lax' });
        
        try {
            const config = { withCredentials: true }; 
            const response = await axios.get(`${API_BASE_URL}/conversations/${id}`, config);
            
            setHistory(sanitizeMessages(response.data.messages));
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
        Cookies.remove('last-conversation-id');
        setConversationId(null);
        setHistory([]);
        setIsLoading(false); // CRITICAL: Ensure input is enabled
        setShouldRefreshList(false);
        streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
        streamingTimersRef.current = [];
        
        reloadSidebarList(); 

        // NEW: Programmatically focus the textarea to allow immediate typing
        setTimeout(() => {
            textareaRef.current?.focus();
        }, 50); 
    };


    // --- Delete Conversation Handler ---
    const deleteConversation = async (id, e) => {
        e.stopPropagation(); 
        if (!window.confirm("Are you sure you want to delete this conversation?")) return;

        try {
            await axios.delete(`${API_BASE_URL}/conversations/${id}`, {
                withCredentials: true,
            });

            setConversationList(prev => prev.filter(c => c._id !== id));
            
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
    
    
    // --- SECONDARY EFFECT HOOK (Updates sidebar list when a new conversation ID is ready) ---
    useEffect(() => {
        if (shouldRefreshList && !isLoading) {
            reloadSidebarList();
            setShouldRefreshList(false); 
        }
    }, [shouldRefreshList, isLoading, reloadSidebarList]);


    // Scroll to the bottom whenever history changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isHistoryLoading]);

    // Clean up any streaming timers on unmount
    useEffect(() => {
        return () => {
                streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
                streamingTimersRef.current = [];
        };
    }, []);
    
    
    // Handles sending the message to the backend 
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        
        const userPrompt = input.trim();
        const newUserMessage = { sender: 'user', text: userPrompt };
        const streamId = `stream-${Date.now()}`;
        const placeholder = { sender: 'model', text: '', _streamId: streamId, isStreaming: true }; 

        // Append user message and placeholder in one atomic update
        let placeholderIndex = null;
        setHistory(prev => {
            const next = [...prev, newUserMessage, placeholder];
            placeholderIndex = next.length - 1;
            return next;
        });
        setInput('');
        setIsLoading(true);

        try {
            const config = { withCredentials: true }; 
            
            const payload = { userPrompt: userPrompt, conversationId: conversationId };

            const response = await axios.post(`${API_BASE_URL}/chat`, payload, config);
            
            const aiResponseText = response.data.text;
            const newId = response.data.conversationId;

            if (newId && newId !== conversationId) {
                setConversationId(newId);
                Cookies.set('last-conversation-id', newId, { expires: 7, secure: false, sameSite: 'Lax' });
                
                if (!conversationId) {
                    setShouldRefreshList(true); 
                }
            }

            const finalAIMessageText = aiResponseText || '';

            // --- Streaming Logic ---
            let cursor = 0;

            if (finalAIMessageText.length === 0) {
                // nothing to stream 
                setHistory(prev => prev.map(m => (m._streamId === streamId ? { sender: 'model', text: 'Error: Empty response from AI.', isStreaming: false } : m)));
                setIsLoading(false);
            } else {
                
                const timer = setInterval(() => {
                    cursor += 1;
                    const chunk = finalAIMessageText.slice(0, cursor);

                    setHistory(prev => {
                        const index = prev.findIndex(m => m && m._streamId === streamId);
                        if (index === -1) {
                            clearInterval(timer);
                            return prev;
                        }
                        
                        const copy = prev.slice();
                        copy[index] = { ...copy[index], text: sanitizeText(chunk) };
                        return copy;
                    });

                    if (cursor >= finalAIMessageText.length) {
                        clearInterval(timer);
                        
                        setHistory(prev => {
                            const index = prev.findIndex(m => m && m._streamId === streamId);
                            if (index === -1) return prev;

                            const copy = prev.slice();
                            copy[index] = { sender: 'model', text: sanitizeText(finalAIMessageText), isStreaming: false };
                            return copy;
                        });
                        
                        streamingTimersRef.current = streamingTimersRef.current.filter(t => t.timer !== timer);
                        setIsLoading(false);
                    }
                }, TYPING_SPEED_MS);

                streamingTimersRef.current.push({ id: streamId, timer });
            }

        } catch (error) {
            console.error("Error fetching AI response:", error.response?.data || error.message);
            const errorMessage = { sender: 'model', text: `Error: The Companion is unavailable. Status: ${error.response?.status || 'Network Error'}`, isStreaming: false };
            
            setHistory(prevHistory => prevHistory.map(m => (m._streamId === streamId ? errorMessage : m)));
            setIsLoading(false);
        }
    };
    
    const ArrayOfMessages = (messages) => {
        return Array.isArray(messages);
    };

    if (isListLoading) {
        return (
            <div className="main-chat-layout loading-screen">
                <p>Loading your chat history... 🍥</p>
            </div>
        );
    }

    // --- RENDER START ---
    return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        
        {/* Sidebar - for history list and new chat button */}
        {isAuthenticated && (
            <Sidebar
                conversationList={conversationList}
                fetchMessages={fetchMessages}
                startNewChat={startNewChat}
                deleteConversation={deleteConversation}
                conversationId={conversationId}
                hoverId={hoverId}
                setHoverId={setHoverId}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
        )}

        {/* Main Chat Area - takes up remaining space */}
        <main className="chat-main-content">
            
            {/* Message Display Area */}
            <div className="messages-display-area">
                
                {/* Initial/Empty States */}
                {!isAuthenticated && (
                    <div className="initial-message-screen">
                        <div className="initial-message-content">
                            <h1>Welcome to Anime Companion!</h1>
                            <p>Login or Sign Up to unlock history and personalized recommendations.</p>
                        </div>
                    </div>
                )}
                {isAuthenticated && history.length === 0 && (
                    <div className="initial-message-screen">
                        <div className="initial-message-content">
                            <h1>Welcome, {user.username}!</h1>
                            <p>Ask me anything about your favorite anime, manga, or characters to get started.</p>
                            <p>Start a new chat or select one from the sidebar.</p>
                        </div>
                    </div>
                )}

                {/* Loading Indicator for History Fetch */}
                {isHistoryLoading ? (
                    <div className="initial-message-screen">
                        <div className="initial-message-content">
                            <div className="loading-spinner"></div>
                            <p>Loading messages...</p>
                        </div>
                    </div>
                ) : (
                    // Actual Messages
                    (history || []).map((message, index) => {
                        const isUser = message.sender === 'user';
                        // Check if it's the model's placeholder/streaming message
                        const isStreaming = message.isStreaming || message._streamId;

                        return (
                            <div 
                                key={index} 
                                className={`message-row ${isUser ? 'user-row' : 'model-row'}`}
                            >
                                <div className="message-icon">
                                    {isUser ? '👤' : '🤖'} {/* User/Model icons */}
                                </div>
                                <div className="message-content">
                                    <div className="message-meta">
                                        <strong>{isUser ? (isAuthenticated ? `${user.username}` : 'You') : 'Anime Companion'}</strong>
                                    </div>
                                    <div className={`message-text ${isUser ? 'user-text' : 'model-text'}`}>
                                        {isStreaming && message.text.length === 0 ? (
                                            <ThinkingIndicator />
                                        ) : (
                                            <ReactMarkdown 
                                                children={message.text}
                                                rehypePlugins={[rehypeRaw]}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Scroll Anchor */}
                <div ref={messagesEndRef} className="scroll-anchor" />
            </div>

            {/* Input Form - Fixed at the bottom */}
            <div className="chat-input-area-wrapper">
                <form onSubmit={handleSend} className="chat-input-form">
                    <textarea
                        ref={textareaRef} // Use the textarea ref
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isLoading ? "Waiting for Companion..." : "Message Anime Companion..."}
                        disabled={isLoading || isListLoading} // Disabled if currently loading an AI response OR the list is loading
                        rows="1" // Start at 1 row
                    />
                    <button type="submit" disabled={isLoading || !input.trim() || isListLoading} className="send-btn">
                        {isLoading ? (
                            <div className="send-spinner"></div>
                        ) : (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2.929 3.018l18.5 8.995a.498.498 0 0 1 .002.978l-18.5 9.005c-.32.155-.724-.108-.71-.47L3 17c.01-.271.196-.5.45-.5h13.05a.5.5 0 0 0 0-1H3.45c-.254 0-.44-.229-.45-.5l-.01-4.008c-.01-.271.196-.5.45-.5h13.05a.5.5 0 0 0 0-1H3.45c-.254 0-.44-.229-.45-.5L2.22 3.49c-.014-.361.39-.625.709-.472z" fill="currentColor"></path></svg>
                        )}
                    </button>
                </form>
               
            </div>

        </main>
    </div>
    );
}

export default ChatWindow;