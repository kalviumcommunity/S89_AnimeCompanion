// frontend/src/components/Navbar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; 

export default function Navbar({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) {
    const { isAuthenticated, user } = useAuth(); // Removed 'logout' from destructuring

    return (
        <nav className="main-nav">
            <div className="nav-left">
                <h1 className="nav-title">Anime Companion AI</h1>
            </div>
            <div className="nav-right">
                {isAuthenticated ? (
                    <>
                        {/* Home Button */}
                        <button 
                            onClick={() => setCurrentView('Home')} 
                            disabled={currentView === 'Home'}
                            className="nav-btn"
                        >
                            Home
                        </button>
                        
                        {/* Show Sidebar Toggle only when on the Chat view */}
                        {currentView === 'Chat' && (
                            <button 
                                onClick={() => setSidebarOpen(s => !s)} 
                                className="toggle-sidebar-button nav-btn"
                            >
                                {sidebarOpen ? 'Hide Chats' : 'Show Chats'}
                            </button>
                        )}
                        
                        {/* 🌟 REMOVED: nav-user and logout button */}
                        {/* They will now live in Sidebar.jsx */}
                    </>
                ) : (
                    <span className="nav-login">
                        Login to start chatting and save your history!
                    </span>
                )}
            </div>
        </nav>
    );
}