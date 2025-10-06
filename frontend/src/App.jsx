// // frontend/src/App.jsx
// import React from 'react';
// import ChatWindow from './components/ChatWindow'; // We'll create this next
// import './App.css'; // You can use the default CSS or replace it

// function App() {
//   return (
//     <div className="app-container">
//       <header className="app-header">
//         <h1>Anime Companion</h1>
//         <p>Ask me about episode summaries, characters, or recommendations!</p>
//       </header>
//       <main>
//         <ChatWindow />
//       </main>
//     </div>
//   );
// }

// export default App;

// frontend/src/App.jsx
import React from 'react';
import ChatWindow from './components/ChatWindow';
import AuthForm from './components/AuthForm'; // <--- NEW IMPORT
import { useAuth } from './context/AuthContext'; // <--- NEW IMPORT
import './App.css'; 

function App() {
  const { isAuthenticated, user, logout } = useAuth(); // Get authentication state

  // Show a loading screen while checking for the token/user state
  // if (isLoading) {
  //     return <div>Loading Application...</div>;
  // }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍜 Anime Companion AI 🦊</h1>
        {/* Navigation/User Status Area */}
        {isAuthenticated ? (
          <div className="auth-status">
            <p>Logged in as: <strong>{user.username || 'User'}</strong></p>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        ) : (
          <p>Login to unlock personalized recommendations!</p>
        )}
      </header>
      
      <main>
        {/* Conditional Rendering */}
        <div className="main-content-wrapper">
          {isAuthenticated ? (
            // If logged in, show the main chat window
            <ChatWindow />
          ) : (
            // If NOT logged in, show the authentication form
            <AuthForm />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;