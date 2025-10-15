// frontend/src/components/Sidebar.jsx (Updated to a modern, ChatGPT/Gemini-like structure)

import React from 'react';

// Helper component for the delete icon (using SVG for a cleaner look)
const DeleteIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="delete-svg-icon"
    >
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
);

// Sidebar component - renders conversation list and controls
export default function Sidebar({
  conversationList = [],
  fetchMessages = () => {},
  startNewChat = () => {},
  deleteConversation = () => {},
  conversationId = null,
  hoverId = null,
  setHoverId = () => {},
  sidebarOpen = true,
  setSidebarOpen = () => {},
}) {
  
  // Helper to format date simply for the list view
  const formatListDate = (dateString) => {
    // Show only month/day/year for simplicity
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
  };

  return (
    <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
      
      {/* Top section: New Chat button and sidebar controls */}
      <div className="sidebar-header-controls">
        <button 
          onClick={startNewChat} 
          className="new-chat-btn" 
          title="Start new chat"
        >
            {/* Using a modern icon for new chat */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            {sidebarOpen && <span className="btn-text">New Chat</span>}
        </button>

        {/* Toggle button for collapsing/expanding the sidebar */}
        <button 
            onClick={() => setSidebarOpen(prev => !prev)} 
            className="sidebar-toggle-btn" 
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
             {/* Simple arrow icon for collapse/expand */}
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
      </div>

      {/* Conversation List (Only visible when open) */}
      {sidebarOpen && (
        <div className="conversation-list-container">
          {conversationList.length === 0 ? (
             <p className="no-chats-message">No history yet.</p>
          ) : (
            <div className="chat-history-list">
              {conversationList.map((conv) => (
                <div
                  key={conv._id}
                  onClick={() => fetchMessages(conv._id)}
                  onMouseEnter={() => setHoverId(conv._id)}
                  onMouseLeave={() => setHoverId(null)}
                  className={`chat-history-item ${conv._id === conversationId ? 'active' : ''}`}
                >
                  <div className="chat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                  </div>
                  
                  <p className="chat-title" title={conv.title || 'Untitled Chat'}>
                    {conv.title || 'Untitled Chat'}
                  </p>
                  
                  {/* Delete button only appears on hover/selection */}
                  {(hoverId === conv._id || conv._id === conversationId) && (
                    <button 
                      className="delete-chat-btn" 
                      onClick={(e) => deleteConversation(conv._id, e)}
                      title="Delete Conversation"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                  
                  {/* Optional: Date as a separate element or as a tooltip */}
                  {/* <span className="chat-list-date">{formatListDate(conv.updatedAt)}</span> */}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
    

    </aside>
  );
}