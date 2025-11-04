// frontend/src/components/Sidebar.jsx (FINAL UPDATE: Logout Icon in Collapsed State)

import React from 'react';
import { useAuth } from '../context/AuthContext'; // 🌟 Import Auth Context
import styles from './Sidebar.module.css'; 

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
        className={styles['delete-svg-icon']} 
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
  setCurrentView = () => {}, // Assuming this prop is available
}) {
  
  // 🌟 Get user and logout from context
  const { user, logout } = useAuth(); 
  
  // Helper to format date simply for the list view (retained)
  const formatListDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
    });
  };

  return (
    <aside className={`${styles['app-sidebar']} ${sidebarOpen ? styles.open : styles.collapsed}`}>
      
      {/* 🎯 HEADER: Contains the three primary buttons for all states */}
      <div className={styles['sidebar-header-controls']}>
        
        {/* 1. HOME BUTTON */}
        <button 
            onClick={() => setCurrentView('Home')} 
            className={styles['home-nav-btn']} 
            title="Go to Home Screen"
        >
            {/* Home Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            
            {sidebarOpen && <span className={styles['btn-text']}>Home</span>}
        </button>

        {/* 2. NEW CHAT BUTTON */}
        <button 
          onClick={startNewChat} 
          className={styles['new-chat-btn']} 
          title="Start a New Conversation"
        >
            {/* New Chat Icon (Plus sign) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            
            {sidebarOpen && <span className={styles['btn-text']}>New</span>}
        </button>

        {/* 3. SHOW/HIDE CHATS TOGGLE BUTTON */}
        <button 
            onClick={() => setSidebarOpen(prev => !prev)} 
            className={styles['sidebar-toggle-btn']} 
            aria-label={sidebarOpen ? "Hide Chats" : "Show Chats"}
            title={sidebarOpen ? "Hide Chats" : "Show Chats"}
        >
             {/* Icon changes based on state: Arrow for collapse/expand */}
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sidebarOpen ? (
                    <polyline points="15 18 9 12 15 6" /> // Arrow left (Collapse)
                ) : (
                    <polyline points="9 18 15 12 9 6" /> // Arrow right (Expand)
                )}
             </svg>
        </button>
      </div>

      {/* 🎯 MAIN CONTENT/LIST AREA: ONLY RENDERED IF SIDEBAR IS OPEN */}
      {sidebarOpen && (
        <div className={styles['conversation-list-container']}>
        {/* ... (conversation list rendering) ... */}
            {conversationList.length === 0 ? (
                <p className={styles['no-chats-message']}>No history yet.</p>
            ) : (
                <div className={styles['chat-history-list']}>
                {conversationList.map((conv) => (
                    <div
                    key={conv._id}
                    onClick={() => fetchMessages(conv._id)}
                    onMouseEnter={() => setHoverId(conv._id)}
                    onMouseLeave={() => setHoverId(null)}
                    className={`${styles['chat-history-item']} ${conv._id === conversationId ? styles.active : ''}`}
                    >
                    <div className={styles['chat-icon']}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    
                    <p className={styles['chat-title']} title={conv.title || 'Untitled Chat'}>
                        {conv.title || 'Untitled Chat'}
                    </p>
                    
                    {/* Delete button only appears on hover/selection */}
                    {(hoverId === conv._id || conv._id === conversationId) && (
                        <button 
                        className={styles['delete-chat-btn']} 
                        onClick={(e) => deleteConversation(conv._id, e)}
                        title="Delete Conversation"
                        >
                        <DeleteIcon />
                        </button>
                    )}
                    
                    </div>
                ))}
                </div>
            )}
        </div>
      )}
      
      {/* 🎯 LOGOUT/USER FOOTER: MOVED OUTSIDE CONDITIONAL BLOCK */}
      <div className={styles['sidebar-footer']}>
          {/* User Info (Only visible when open) */}
          {sidebarOpen && (
              <div className={styles['user-info-status']}>
                  <span className={styles['user-name-label']}>
                      Logged in as: <strong>{user?.username || 'User'}</strong>
                  </span>
              </div>
          )}
          
          {/* 🎯 Logout Button (Always rendered, shrinks via CSS) */}
          <button 
              onClick={logout} 
              className={styles['logout-button-sidebar']}
              title="Logout"
          >
              {/* Logout Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              
              {/* Text: Only visible when open */}
              {sidebarOpen && <span className={styles['btn-text']}>Logout</span>}
          </button>
      </div>
    </aside>
  );
}