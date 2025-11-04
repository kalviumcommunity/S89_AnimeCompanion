// frontend/src/components/Navbar.jsx (FINAL UPDATE: Back Button with State Logic)

import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css'; 

export default function Navbar({ currentView, setCurrentView, sidebarOpen, setSidebarOpen }) {
    const { isAuthenticated, user } = useAuth(); // Removed 'logout' from destructuring

    // 🎯 Function to handle navigation back one step based on known paths
    const handleGoBack = () => {
        if (currentView === 'Recommendations') {
            // Explicitly navigate from Recommendations back to Home
            setCurrentView('Home');
        } else {
            // Fallback for other non-Home views (though Chat is removed, and others are unknown)
            // Using window.history.back() as a general fallback is risky, so we default to Home
            setCurrentView('Home');
        }
    };

    // Determine if the Back button should be visible (i.e., not on the Home or Chat view)
    const isBackButtonVisible = isAuthenticated && currentView !== 'Home' && currentView !== 'Chat';
    
    return (
        <nav className="main-nav">
            <div className="nav-left">
                {/* 🎯 NEW: Back Button (Left Arrow) */}
                {isBackButtonVisible && (
                    <button 
                        onClick={handleGoBack} 
                        className="nav-btn back-btn"
                        title="Go Back"
                    >
                        {/* Left Arrow Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                    </button>
                )}
                <h1 className="nav-title">Anime Companion AI</h1>
            </div>
            <div className="nav-right">
                {isAuthenticated ? (
                    <>
                        {/* Buttons are successfully removed from here */}
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