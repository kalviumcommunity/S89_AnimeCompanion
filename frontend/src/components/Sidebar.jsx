import React from 'react';

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
  return (
    <aside className={`chat-sidebar modern-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-top">
        <button onClick={startNewChat} className="new-chat-button" title="New chat">
          {sidebarOpen ? '+ New' : '+'}
        </button>
        {sidebarOpen && <h3 className="sidebar-header">Chats</h3>}
      </div>

      {sidebarOpen && (
        <div className="conversation-list-wrapper">
          {conversationList.length === 0 && <p className="no-chats">No saved chats yet.</p>}
          <div className="conversation-list">
            {conversationList.map((conv) => (
              <div
                key={conv._id}
                onClick={() => fetchMessages(conv._id)}
                onMouseEnter={() => setHoverId(conv._id)}
                onMouseLeave={() => setHoverId(null)}
                className={`conversation-item ${conv._id === conversationId ? 'active' : ''}`}
              >
                <div className="left-col">
                  <p className="title">{conv.title || 'Untitled'}</p>
                  <span className="chat-date">{new Date(conv.updatedAt).toLocaleDateString()}</span>
                </div>
                {hoverId === conv._id && (
                  <button className="delete-button" onClick={(e) => deleteConversation(conv._id, e)}>
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!sidebarOpen && (
        <button className="open-sidebar-fab" onClick={() => setSidebarOpen(true)} aria-label="Open chats">
          ☰
        </button>
      )}
    </aside>
  );
}
