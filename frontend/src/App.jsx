
// // frontend/src/App.jsx
// import React from 'react';
// import ChatWindow from './components/ChatWindow';
// import AuthForm from './components/AuthForm'; // <--- NEW IMPORT
// import { useAuth } from './context/AuthContext'; // <--- NEW IMPORT
// import './App.css'; 

// function App() {
//   const { isAuthenticated, user, logout } = useAuth(); // Get authentication state

//   // Show a loading screen while checking for the token/user state
//   // if (isLoading) {
//   //     return <div>Loading Application...</div>;
//   // }

//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>🍜 Anime Companion AI 🦊</h1>
//         {/* Navigation/User Status Area */}
//         {isAuthenticated ? (
//           <div className="auth-status">
//             <p>Logged in as: <strong>{user.username || 'User'}</strong></p>
//             <button onClick={logout} className="logout-button">Logout</button>
//           </div>
//         ) : (
//           <p>Login to unlock personalized recommendations!</p>
//         )}
//       </header>
      
//       <main>
//         {/* Conditional Rendering */}
//         <div className="main-content-wrapper">
//           {isAuthenticated ? (
//             // If logged in, show the main chat window
//             <ChatWindow />
//           ) : (
//             // If NOT logged in, show the authentication form
//             <AuthForm />
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;

// // frontend/src/App.jsx (FINAL FIX: Adding Axios Configuration)

// import React, { useState } from 'react'; 
// import ChatWindow from './components/ChatWindow';
// import AuthForm from './components/AuthForm';
// import UserProfileEditor from './components/UserProfileEditor'; 
// import { useAuth } from './context/AuthContext'; 
// import './App.css'; 

// // CRITICAL IMPORT: Used to configure global request settings
// import axios from 'axios'; 

// // CRITICAL FIX: Tell Axios to send cookies/credentials with every cross-origin request.
// // This resolves the 'JWT in cookies: NOT FOUND' error.
// axios.defaults.withCredentials = true; 

// function App() {
//   const { isAuthenticated, user, logout } = useAuth(); 
//   // State to manage which main view is visible (Chat or Profile)
//   const [currentView, setCurrentView] = useState('Chat'); 

//   const renderView = () => {
//     if (!isAuthenticated) {
//       // Always show AuthForm if not logged in
//       return <AuthForm />;
//     }
    
//     switch (currentView) {
//       case 'Profile':
//         return <UserProfileEditor />;
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
//             <button onClick={() => setCurrentView('Profile')} disabled={currentView === 'Profile'}>Edit Profile</button>
//             <p>Logged in as: <strong>{user.username}</strong></p>
//             <button onClick={logout} className="logout-button">Logout</button>
//           </nav>
//         )}
//         {!isAuthenticated && <p>Login to unlock personalization and history!</p>}
//       </header>
      
//       <main>
//         <div className="main-content-wrapper">
//           {renderView()} {/* Renders the Chat or Profile Editor */}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default App;

// frontend/src/App.jsx (Updated with Recommendations View)

import React, { useState } from 'react'; 
import ChatWindow from './components/ChatWindow';
import AuthForm from './components/AuthForm';
import UserProfileEditor from './components/UserProfileEditor'; 
import RecommendationsPage from './components/RecommendationsPage'; // <--- NEW IMPORT
import { useAuth } from './context/AuthContext'; 
import './App.css'; 
import axios from 'axios'; 

axios.defaults.withCredentials = true; 

function App() {
  const { isAuthenticated, user, logout } = useAuth(); 
  // State to manage which main view is visible (Chat, Profile, or Recommendations)
  const [currentView, setCurrentView] = useState('Chat'); 

  const renderView = () => {
    if (!isAuthenticated) {
      return <AuthForm />;
    }
    
    switch (currentView) {
      case 'Profile':
        return <UserProfileEditor />;
      case 'Recommendations': // <--- NEW CASE
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
            <button onClick={() => setCurrentView('Chat')} disabled={currentView === 'Chat'}>Chat</button>
            {/* ADD NEW NAVIGATION BUTTON */}
            <button onClick={() => setCurrentView('Recommendations')} disabled={currentView === 'Recommendations'}>Get Recommendations</button> 
            <button onClick={() => setCurrentView('Profile')} disabled={currentView === 'Profile'}>Edit Profile</button>
            <p>Logged in as: <strong>{user.username}</strong></p>
            <button onClick={logout} className="logout-button">Logout</button>
          </nav>
        )}
        {!isAuthenticated && <p>Login to unlock personalization and history!</p>}
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