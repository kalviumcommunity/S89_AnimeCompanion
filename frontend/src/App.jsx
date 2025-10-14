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

  const renderView = () => {
    if (!isAuthenticated) {
      return <AuthForm />;
    }
    switch (currentView) {
      case 'Recommendations':
        return <RecommendationsPage />;
      case 'Chat':
      default:
        return <ChatWindow />;
    }
  };

  return (
    <div className="app-page">
      {/* ✅ Top Header / Buttons OUTSIDE chatbot */}
      <nav className="main-nav">
        <div className="nav-left">
          <h1 className="nav-title">🍜 Anime Companion AI 🦊</h1>
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <button onClick={() => setSidebarOpen(s => !s)} className="toggle-sidebar-button">Chats</button>
              <button onClick={() => setCurrentView('Chat')} disabled={currentView === 'Chat'}>Chat Window</button>
              <button onClick={() => setCurrentView('Recommendations')} disabled={currentView === 'Recommendations'}>Get Recommendations</button>
              <span className="nav-user">Logged in as: <strong>{user.username}</strong></span>
              <button onClick={logout} className="logout-button">Logout</button>
            </>
          ) : (
            <span className="nav-login">Login to start chatting and save your history!</span>
          )}
        </div>
      </nav>

      {/* ✅ Centered chatbot below header */}
        <div className="chatbot-wrapper">
        {isAuthenticated ? (
          // pass sidebar state into chat view so navbar can toggle it
          currentView === 'Chat' ? <ChatWindow sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> : <RecommendationsPage />
        ) : (
          <AuthForm />
        )}
      </div>
    </div>
  );
}

export default App;
