// frontend/src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatWindow.css'; // We'll define simple styles below

const API_BASE_URL = 'http://localhost:3001/api/ai/chat';

function ChatWindow() {
  // State for the conversation history
  const [history, setHistory] = useState([]); 
  // State for the current user input
  const [input, setInput] = useState('');
  // State to disable input while waiting for AI response
  const [isLoading, setIsLoading] = useState(false);

  // Ref to automatically scroll to the latest message
  const messagesEndRef = useRef(null);

  // Scroll to the bottom of the chat window whenever history changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);


  // Handles sending the message to the backend
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userPrompt = input.trim();
    // 1. Add user message to history immediately
    const newUserMessage = { sender: 'user', text: userPrompt };
    
    // Convert history to the format required by the backend
    const conversationHistory = [...history, newUserMessage];
    setHistory(conversationHistory); 
    
    setInput('');
    setIsLoading(true);

    try {
      // 2. Make the API call to your Express backend
      const response = await axios.post(API_BASE_URL, {
        userPrompt: userPrompt,
        // Send the entire current history so the AI has context
        conversationHistory: history, 
      });

      // 3. Add AI response to history
      const aiMessage = { 
        sender: 'model', 
        text: response.data.text 
      };
      
      setHistory(prevHistory => [...prevHistory, aiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = { 
        sender: 'model', 
        text: "Error: Sorry, the Anime Companion is currently unavailable. Check the backend server." 
      };
      setHistory(prevHistory => [...prevHistory, errorMessage]);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {history.length === 0 && (
            <div className="initial-message">
                Welcome! Ask me a question about your favorite anime!
            </div>
        )}
        {history.map((message, index) => (
          <div 
            key={index} 
            className={`message-bubble ${message.sender}`}
          >
            <strong>{message.sender === 'user' ? 'You:' : 'Anime Companion:'}</strong>
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