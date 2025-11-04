// frontend/src/App.jsx (UPDATED: Passing setCurrentView to ChatWindow)

import React, { useState } from 'react'; 
import ChatWindow from './components/ChatWindow';
import AuthForm from './components/AuthForm';
import RecommendationsPage from './components/RecommendationsPage'; 
import HomePage from './components/HomePage'; 
import Navbar from './components/Navbar'; // 🌟 Importing the separate Navbar component
import { useAuth } from './context/AuthContext'; 
import './App.css'; 
import axios from 'axios'; 

axios.defaults.withCredentials = true; 

function App() {
  const { isAuthenticated, user, logout } = useAuth(); 
  
  // State to control which main view is displayed
  const [currentView, setCurrentView] = useState('Home'); 
  
  // State lifted from ChatWindow to be controlled by Navbar/Home components
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper function to render the current view based on state
  const renderView = () => {
      // If not authenticated, always show the login/signup form
      if (!isAuthenticated) {
        return <AuthForm />;
      }
      
      // If authenticated, render the selected view
      switch (currentView) {
        case 'Home':
          // HomePage needs setCurrentView to navigate to Chat or Recs
          return <HomePage setCurrentView={setCurrentView} />;
        case 'Chat':
          // ChatWindow needs sidebar state management AND setCurrentView
          return (
            <ChatWindow 
              sidebarOpen={sidebarOpen} 
              setSidebarOpen={setSidebarOpen} 
              setCurrentView={setCurrentView} // 🎯 ADDED: Passing navigation function
            />
          );
        case 'Recommendations':
          return <RecommendationsPage />;
        default:
          return <HomePage setCurrentView={setCurrentView} />;
      }
  };

  return (
    // The top-level 'app-page' container handles the full-screen background and structure.
    <div className="app-page">
      
      {/* 🎯 CRITICAL CHANGE: Only render Navbar if the current view is NOT 'Chat' */}
      {currentView !== 'Chat' && (
        <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
        />
      )}

      {/* Main Content Wrapper: This container holds the current view (AuthForm, HomePage, ChatWindow, etc.) */}
      <div className="chatbot-wrapper">
        {renderView()}
      </div>
    </div>
  );
}

export default App;