// frontend/src/App.jsx
import React from 'react';
import ChatWindow from './components/ChatWindow'; // We'll create this next
import './App.css'; // You can use the default CSS or replace it

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>🍜 Anime Companion AI 🦊</h1>
        <p>Ask me about episode summaries, characters, or recommendations!</p>
      </header>
      <main>
        <ChatWindow />
      </main>
    </div>
  );
}

export default App;