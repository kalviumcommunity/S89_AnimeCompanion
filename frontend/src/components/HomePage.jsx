// frontend/src/components/HomePage.jsx

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './HomePage.css'; // Don't forget to create this CSS file

// This component receives the navigation function from App.jsx
const HomePage = ({ setCurrentView }) => {
    const { user } = useAuth();

    return (
        <div className="home-container">
            <div className="home-card">
                <h2>Welcome back, {user?.username || 'Companion'}!</h2>
                <p>Choose your path to anime mastery:</p>
                
                <div className="feature-buttons">
                    
                    <button 
                        className="feature-btn chat-btn"
                        onClick={() => setCurrentView('Chat')}
                    >
                        <h3>🤖 Start Chatting</h3>
                        <p>Ask about episode summaries, characters, and deep trivia.</p>
                    </button>

                    <button 
                        className="feature-btn recommendation-btn"
                        onClick={() => setCurrentView('Recommendations')}
                    >
                        <h3>🌟 Get Recommendations</h3>
                        <p>Receive personalized anime and manga suggestions.</p>
                    </button>

                </div>
            </div>
        </div>
    );
};

export default HomePage;