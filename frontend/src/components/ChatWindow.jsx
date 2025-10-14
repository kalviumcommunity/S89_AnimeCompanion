// frontend/src/components/ChatWindow.jsx (FINAL, FULLY STABLE VERSION)

import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import Cookies from 'js-cookie'; 
import ReactMarkdown from 'react-markdown'; 
import rehypeRaw from 'rehype-raw';       
import './ChatWindow.css'; 
import Sidebar from './Sidebar';

const API_BASE_URL = 'https://tsd-animecompanion.onrender.com/api/ai';

// Helper function to format date for the sidebar
const formatChatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
};


function ChatWindow({ sidebarOpen: sidebarOpenProp = true, setSidebarOpen: setSidebarOpenProp = () => {} }) {
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
    const streamingTimersRef = useRef([]);
    // use lifted sidebar state when provided
    const [localSidebarOpen] = useState(true);
    const sidebarOpen = typeof sidebarOpenProp === 'boolean' ? sidebarOpenProp : localSidebarOpen;
    const setSidebarOpen = typeof setSidebarOpenProp === 'function' ? setSidebarOpenProp : () => {};

    // Helper: remove spaces before punctuation so commas/periods don't float to next line
    const sanitizeText = (text) => {
        if (!text || typeof text !== 'string') return text;
        // Attach punctuation to the previous word even if separated by spaces/newlines
        // Examples handled: "word ," -> "word,"  and "word\n," -> "word,"
        let s = text;
        // remove spaces before punctuation
        s = s.replace(/\s+([,.;:!?])/g, '$1');
        // remove newlines before punctuation (and any spaces between)
        s = s.replace(/\n+\s*([,.;:!?])/g, '$1');
        // if punctuation starts its own line (e.g. "\n, ..."), move it back to previous line
        s = s.replace(/\n{1,}\s*([,.;:!?])\s*/g, '$1 ');
        // collapse multiple blank lines into maximum two
        s = s.replace(/\n{3,}/g, '\n\n');
        return s.trim();
    };

    const sanitizeMessages = (messages) => {
        if (!Array.isArray(messages)) return [];
        return messages.map(m => ({ ...m, text: typeof m.text === 'string' ? sanitizeText(m.text) : m.text }));
    };
  
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
        
        // Auto-load logic
        const lastId = Cookies.get('last-conversation-id');
        const targetId = lastId && response.data.some(c => c._id === lastId) 
                           ? lastId
                           : null; 
        
        if (targetId) {
            const historyResponse = await axios.get(`${API_BASE_URL}/conversations/${targetId}`, config);
            setHistory(sanitizeMessages(historyResponse.data.messages));
            setConversationId(targetId);
        } else {
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
      // clear any streaming timers and stop existing streams before switching
      streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
      streamingTimersRef.current = [];

      setIsHistoryLoading(true);
      Cookies.set('last-conversation-id', id, { expires: 7, secure: false, sameSite: 'Lax' });
      
      try {
          const config = { headers: {} }; 
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
      // clear any streaming timers and stop active streams
      streamingTimersRef.current.forEach(({ timer }) => clearInterval(timer));
      streamingTimersRef.current = [];
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
        const placeholder = { sender: 'model', text: '', _streamId: streamId };

        // Append user message and placeholder in one atomic update to preserve order
        let placeholderIndex = null;
        setHistory(prev => {
            const next = [...prev, newUserMessage, placeholder];
            placeholderIndex = next.length - 1;
            return next;
        });
        setInput('');
        setIsLoading(true);

    try {
      const config = { headers: {} }; 
      
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

                    const finalAIMessageText = aiResponseText || '';

                    // Streaming: reveal characters progressively into the existing placeholder
                    const revealSpeed = 18; // ms per character (tune to taste)
                    let cursor = 0;

                    if (finalAIMessageText.length === 0) {
                        // nothing to stream — replace placeholder with an error message
                        setHistory(prev => prev.map(m => (m._streamId === streamId ? { sender: 'model', text: 'Error: Empty response from AI.' } : m)));
                        setIsLoading(false);
                    } else {
                        // We captured placeholderIndex earlier; if not, find it
                        if (placeholderIndex === null) {
                            placeholderIndex = history.findIndex(m => m && m._streamId === streamId);
                        }

                        const timer = setInterval(() => {
                            cursor += 1;
                            const chunk = finalAIMessageText.slice(0, cursor);

                            setHistory(prev => {
                                // defensive: if index is invalid, fall back to mapping
                                if (placeholderIndex == null || placeholderIndex < 0 || placeholderIndex >= prev.length) {
                                    return prev.map(m => (m._streamId === streamId ? { ...m, text: sanitizeText(chunk) } : m));
                                }
                                const copy = prev.slice();
                                copy[placeholderIndex] = { ...copy[placeholderIndex], text: sanitizeText(chunk) };
                                return copy;
                            });

                            if (cursor >= finalAIMessageText.length) {
                                clearInterval(timer);
                                setHistory(prev => {
                                    if (placeholderIndex == null || placeholderIndex < 0 || placeholderIndex >= prev.length) {
                                        return prev.map(m => (m._streamId === streamId ? { sender: 'model', text: sanitizeText(finalAIMessageText) } : m));
                                    }
                                    const copy = prev.slice();
                                    copy[placeholderIndex] = { sender: 'model', text: sanitizeText(finalAIMessageText) };
                                    return copy;
                                });
                                streamingTimersRef.current = streamingTimersRef.current.filter(t => t.timer !== timer);
                                setIsLoading(false);
                            }
                        }, revealSpeed);

                        streamingTimersRef.current.push({ id: streamId, timer, index: placeholderIndex });
                    }

    } catch (error) {
      console.error("Error fetching AI response:", error.response?.data || error.message);
      const errorMessage = { sender: 'model', text: `Error: The Companion is unavailable. Status: ${error.response?.status || 'Network Error'}` };
      
                    // Replace any placeholder for this stream with the error message
                    setHistory(prevHistory => prevHistory.map(m => (m._streamId === streamId ? errorMessage : m)));
    } finally {
                    // nothing here; isLoading is managed by streaming completion or error paths
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
    <div className={`main-chat-layout modern ${sidebarOpen ? '' : 'collapsed'}`}>
        {/* Sidebar for History List - always in DOM but may be collapsed */}
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

        {/* Main Chat Area */}
        <main className="chat-container modern-chat">
            <div className="chat-messages modern-messages">
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
                    (history || []).map((message, index) => (
                        <div 
                            key={index} 
                            className={`message-bubble ${message.sender} ${message._streamId ? 'streaming' : ''}`}
                        >
                            <div className="bubble-meta">
                              <strong>{message.sender === 'user' ? (isAuthenticated ? `${user.username}` : 'You') : 'Companion'}</strong>
                              <span className="bubble-time">{/* optional time */}</span>
                            </div>
                            <ReactMarkdown 
                                children={message.text}
                                rehypePlugins={[rehypeRaw]}
                            />
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

            <form onSubmit={handleSend} className="chat-input-form modern-input">
                <button type="button" className="attach-btn" title="Attach">📎</button>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isLoading ? "Waiting for response..." : "Send a message..."}
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="send-btn">
                    {isLoading ? '⏳' : 'Send'}
                </button>
            </form>
        </main>
    </div>
  );
}

export default ChatWindow;