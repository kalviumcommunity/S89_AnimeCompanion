// frontend/src/components/RecommendationsPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './RecommendationsPage.css'; // New CSS file for styling

const API_BASE_URL = 'http://localhost:3001/api/users/recommendations';

// Component to display a single recommendation card
const AnimeCard = ({ anime }) => (
    <div className="anime-card">
        <h3>{anime.title} ({anime.year})</h3>
        <p className="genres">
            <span className="label">Genres:</span> {anime.genres.join(' | ')}
        </p>
        <p className="summary">
            <span className="label">Summary:</span> {anime.summary}
        </p>
        <div className="reasoning-box">
            <span className="label">Why this?</span> {anime.reasoning}
        </div>
    </div>
);


function RecommendationsPage() {
    const { isAuthenticated } = useAuth();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchRecommendations = async () => {
            setLoading(true);
            setError(null);
            try {
                // Axios will automatically send the HTTP-only cookie credentials
                const response = await axios.get(API_BASE_URL); 
                
                // Expects a clean JSON array of 5 recommendations
                setRecommendations(response.data); 
                
            } catch (err) {
                console.error('API Error:', err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load recommendations. Try logging in again.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchRecommendations();
        // NOTE: We only fetch once when the component loads, not on every render.
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return <div className="recommendations-message">Please log in to view your personalized recommendations.</div>;
    }
    
    if (loading) {
        return <div className="recommendations-message loading">Generating 5 personalized anime recommendations... 🤖</div>;
    }

    if (error) {
        return <div className="recommendations-message error">Error: {error}</div>;
    }
    
    if (recommendations.length === 0) {
        return <div className="recommendations-message">No recommendations generated. Check your profile or try refreshing.</div>;
    }

    return (
        <div className="recommendations-display-page">
            <h2>✨ Top 5 Recommendations Based on Your Profile ✨</h2>
            <div className="recommendations-grid">
                {recommendations.map((anime, index) => (
                    // Ensure the backend response structure matches the AnimeCard props
                    <AnimeCard key={index} anime={anime} />
                ))}
            </div>
        </div>
    );
}

export default RecommendationsPage;