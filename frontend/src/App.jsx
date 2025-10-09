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
      <header className="app-header">
        <h1>🍜 Anime Companion AI 🦊</h1>
        {isAuthenticated && (
          <nav className="auth-nav">
            <button 
              onClick={() => setCurrentView('Chat')} 
              disabled={currentView === 'Chat'}
            >
              Chat Window
            </button>
            <button 
              onClick={() => setCurrentView('Recommendations')} 
              disabled={currentView === 'Recommendations'}
            >
              Get Recommendations
            </button>
            <p>Logged in as: <strong>{user.username}</strong></p>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </nav>
        )}
        {!isAuthenticated && <p>Login to start chatting and save your history!</p>}
      </header>

      {/* ✅ Centered chatbot below header */}
      <div className="chatbot-wrapper">
        {renderView()}
      </div>
    </div>
  );
}

export default App;
