// frontend/src/App.jsx

import React, { useState } from 'react'; 
import ChatWindow from './components/ChatWindow';
import AuthForm from './components/AuthForm';
import RecommendationsPage from './components/RecommendationsPage'; 
import { useAuth } from './context/AuthContext'; 
import './App.css'; 
import axios from 'axios'; 

axios.defaults.withCredentials = true; 

function App() {
  const { isAuthenticated, user, logout } = useAuth(); 
  const [currentView, setCurrentView] = useState('Chat'); 
  // lift sidebar open state so navbar can control it
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // NOTE: The original 'renderView' function was redundant and has been removed.
  // The rendering logic is kept directly inside the return block for simplicity.

  return (
    // The top-level 'app-page' container handles the full-screen blue background and structure.
    <div className="app-page">
      
      {/* Top Navigation Bar: Full width, sticky to top, handles routing and auth */}
      <nav className="main-nav">
        <div className="nav-left">
          <h1 className="nav-title"> Anime Companion AI </h1>
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              {/* Sidebar Toggle Button */}
              <button onClick={() => setSidebarOpen(s => !s)} className="toggle-sidebar-button">
                {sidebarOpen ? 'Hide Chats' : 'Show Chats'}
              </button>
              
              {/* View/Routing Buttons */}
              <button onClick={() => setCurrentView('Chat')} disabled={currentView === 'Chat'}>Chat Window</button>
              <button onClick={() => setCurrentView('Recommendations')} disabled={currentView === 'Recommendations'}>Get Recommendations</button>
              
              {/* User Info and Logout */}
              <span className="nav-user">Logged in as: <strong>{user.username}</strong></span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <span className="nav-login">Login to start chatting and save your history!</span>
          )}
        </div>
      </nav>

      {/* Main Content Wrapper: Stretches to fill space below nav */}
      <div className="chatbot-wrapper">
        {isAuthenticated ? (
          currentView === 'Chat' ? (
            <ChatWindow sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          ) : (
            <RecommendationsPage />
          )
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}

export default App;