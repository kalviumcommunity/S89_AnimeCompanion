

// // frontend/src/App.jsx (Updated with Recommendations View)

// import React, { useState } from 'react'; 
// import ChatWindow from './components/ChatWindow';
// import AuthForm from './components/AuthForm';
// import UserProfileEditor from './components/UserProfileEditor'; 
// import RecommendationsPage from './components/RecommendationsPage'; // <--- NEW IMPORT
// import { useAuth } from './context/AuthContext'; 
// import './App.css'; 
// import axios from 'axios'; 

// axios.defaults.withCredentials = true; 

// function App() {
//   const { isAuthenticated, user, logout } = useAuth(); 
//   // State to manage which main view is visible (Chat, Profile, or Recommendations)
//   const [currentView, setCurrentView] = useState('Chat'); 

//   const renderView = () => {
//     if (!isAuthenticated) {
//       return <AuthForm />;
//     }
    
//     switch (currentView) {
//       case 'Profile':
//         return <UserProfileEditor />;
//       case 'Recommendations': // <--- NEW CASE
//         return <RecommendationsPage />;
//       case 'Chat':
//       default:
//         return <ChatWindow />;
//     }
//   };

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>🍜 Anime Companion AI 🦊</h1>
//         {/* Navigation/User Status Area */}
//         {isAuthenticated && (
//           <nav className="auth-nav">
//             <button onClick={() => setCurrentView('Chat')} disabled={currentView === 'Chat'}>Chat</button>
//             {/* ADD NEW NAVIGATION BUTTON */}
//             <button onClick={() => setCurrentView('Recommendations')} disabled={currentView === 'Recommendations'}>Get Recommendations</button> 
//             <button onClick={() => setCurrentView('Profile')} disabled={currentView === 'Profile'}>Edit Profile</button>
//             <p>Logged in as: <strong>{user.username}</strong></p>
//             <button onClick={logout} className="logout-button">Logout</button>
//           </nav>
//         )}
//         {!isAuthenticated && <p>Login to unlock personalization and history!</p>}
//       </header>
      
//       <main>
//         <div className="main-content-wrapper">
//           {renderView()} 
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;

// frontend/src/App.jsx

import React, { useState } from 'react'; 
import ChatWindow from './components/ChatWindow';
import AuthForm from './components/AuthForm';
// import UserProfileEditor from './components/UserProfileEditor'; // <-- REMOVED
import RecommendationsPage from './components/RecommendationsPage'; // <--- KEPT
import { useAuth } from './context/AuthContext'; 
import './App.css'; 
import axios from 'axios'; 

// Set this globally for all authenticated requests
axios.defaults.withCredentials = true; 

function App() {
  const { isAuthenticated, user, logout } = useAuth(); 
  // State to manage which main view is visible (Chat or Recommendations)
  const [currentView, setCurrentView] = useState('Chat'); 

  const renderView = () => {
    // If not authenticated, always show the login form
    if (!isAuthenticated) {
      return <AuthForm />;
    }
    
    // If authenticated, show the selected view
    switch (currentView) {
      // REMOVED 'Profile' CASE
      case 'Recommendations': 
        return <RecommendationsPage />;
      case 'Chat':
      default:
        return <ChatWindow />;
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍜 Anime Companion AI 🦊</h1>
        {/* Navigation/User Status Area */}
        {isAuthenticated && (
          <nav className="auth-nav">
            {/* Chat Button */}
            <button onClick={() => setCurrentView('Chat')} disabled={currentView === 'Chat'}>Chat Window</button>
            
            {/* Recommendations Display Page Button */}
            <button onClick={() => setCurrentView('Recommendations')} disabled={currentView === 'Recommendations'}>Get Recommendations</button> 
            
            {/* Profile Button is removed */}
            
            <p>Logged in as: <strong>{user.username}</strong></p>
            <button onClick={logout} className="logout-button">Logout</button>
          </nav>
        )}
        {!isAuthenticated && <p>Login to start chatting and save your history!</p>}
      </header>
      
      <main>
        <div className="main-content-wrapper">
          {renderView()} 
        </div>
      </main>
    </div>
  );
}

export default App;