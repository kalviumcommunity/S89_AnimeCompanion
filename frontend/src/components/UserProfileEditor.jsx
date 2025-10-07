// // frontend/src/components/UserProfileEditor.jsx
// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';
// import './UserProfileEditor.css'; // Add a CSS file for styling

// const API_BASE_URL = 'http://localhost:3001/api/users/profile';
// const GENRES = ["Action", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Romance", "Horror", "Slice of Life", "Adventure", "Supernatural"];

// function UserProfileEditor() {
//     const { token, user, isAuthenticated } = useAuth();
    
//     // --- State for Genre Selection ---
//     const [selectedGenres, setSelectedGenres] = useState([]);
//     const [dislikedGenres, setDislikedGenres] = useState([]);
    
//     // --- State for Watch History Input ---
//     const [newAnimeTitle, setNewAnimeTitle] = useState('');
//     const [newAnimeRating, setNewAnimeRating] = useState(null);
    
//     // --- UI State ---
//     const [message, setMessage] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);

//     // Handles toggling a genre as "favorite"
//     const handleGenreToggle = (genre) => {
//         setSelectedGenres(prev => 
//             prev.includes(genre)
//                 ? prev.filter(g => g !== genre)
//                 : [...prev, genre]
//         );
//         // Ensure genre is removed from disliked if it's favorited
//         setDislikedGenres(prev => prev.filter(g => g !== genre));
//     };

//     // Handles toggling a genre as "disliked"
//     const handleDislikeToggle = (genre) => {
//         setDislikedGenres(prev => 
//             prev.includes(genre)
//                 ? prev.filter(g => g !== genre)
//                 : [...prev, genre]
//         );
//         // Ensure genre is removed from favorited if it's disliked
//         setSelectedGenres(prev => prev.filter(g => g !== genre));
//     };

//     // Handles the primary update request (PUT)
//     const handleUpdatePreferences = async (e) => {
//         e.preventDefault();
//         if (!isAuthenticated || isSubmitting) return;

//         setIsSubmitting(true);
//         setMessage(null);

//         try {
//             const payload = {};

//             // Only include non-empty arrays to avoid overriding entire lists in the DB
//             if (selectedGenres.length > 0) {
//                 payload.favorite_genres = selectedGenres;
//             }
//             if (dislikedGenres.length > 0) {
//                 payload.disliked_genres = dislikedGenres;
//             }
            
//             // NOTE: The backend logic uses $addToSet, so it will only add *new* unique genres.
            
//             const config = {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             };

//             const response = await axios.put(API_BASE_URL, payload, config);

//             setMessage(response.data.message || 'Preferences updated successfully!');
//             // Clear temporary selection states
//             setSelectedGenres([]);
//             setDislikedGenres([]);

//         } catch (error) {
//             console.error("Update Preferences Error:", error.response?.data || error);
//             setMessage(error.response?.data?.message || 'Error updating preferences. Check server status.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
    
//     // Handles adding a single item to watch history
//     const handleAddHistory = async (e) => {
//         e.preventDefault();
//         if (!isAuthenticated || isSubmitting || !newAnimeTitle.trim() || !newAnimeRating) return;
        
//         setIsSubmitting(true);
//         setMessage(null);

//         try {
//             const payload = {
//                 add_to_watch_history: {
//                     anime_title: newAnimeTitle.trim(),
//                     rating: parseInt(newAnimeRating)
//                 }
//             };
            
//             const config = {
//                 headers: {
//                     'Authorization': `Bearer ${token}`,
//                     'Content-Type': 'application/json'
//                 }
//             };

//             await axios.put(API_BASE_URL, payload, config);

//             setMessage(`Added "${newAnimeTitle}" to history!`);
//             // Clear input fields
//             setNewAnimeTitle('');
//             setNewAnimeRating(null);

//         } catch (error) {
//             console.error("Add History Error:", error.response?.data || error);
//             setMessage(error.response?.data?.message || 'Error adding to history. Check rating bounds.');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     if (!isAuthenticated) {
//         return <div className="profile-message">Please log in to edit your preferences and history.</div>;
//     }
    
//     return (
//         <div className="profile-editor-container">
//             <h2>{user.username}'s Anime Profile</h2>
            
//             {message && <p className={`status-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
            
//             {/* 1. Genre Preferences Form */}
//             <form onSubmit={handleUpdatePreferences} className="form-section">
//                 <h3>1. Update Favorite Genres</h3>
//                 <div className="genre-grid">
//                     {GENRES.map(genre => (
//                         <button
//                             key={genre}
//                             type="button"
//                             onClick={() => handleGenreToggle(genre)}
//                             className={`genre-button ${selectedGenres.includes(genre) ? 'favorite' : ''} ${dislikedGenres.includes(genre) ? 'disliked' : ''}`}
//                             disabled={isSubmitting}
//                         >
//                             {genre}
//                             {selectedGenres.includes(genre) ? ' ⭐' : ''}
//                             {dislikedGenres.includes(genre) ? ' ❌' : ''}
//                         </button>
//                     ))}
//                 </div>
//                 <div className="current-selection">
//                     <p>Favorite (will be added): <strong>{selectedGenres.join(', ') || 'None'}</strong></p>
//                     <p>Disliked (will be added): <strong>{dislikedGenres.join(', ') || 'None'}</strong></p>
//                 </div>
//                 <button type="submit" disabled={isSubmitting || (selectedGenres.length === 0 && dislikedGenres.length === 0)}>
//                     {isSubmitting ? 'Saving...' : 'Save New Genres'}
//                 </button>
//             </form>
            
//             {/* 2. Watch History Form */}
//             <form onSubmit={handleAddHistory} className="form-section">
//                 <h3>2. Add to Watch History</h3>
//                 <input
//                     type="text"
//                     placeholder="Anime Title (e.g., Bleach)"
//                     value={newAnimeTitle}
//                     onChange={(e) => setNewAnimeTitle(e.target.value)}
//                     required
//                 />
//                 <input
//                     type="number"
//                     placeholder="Your Rating (1-10)"
//                     min="1"
//                     max="10"
//                     value={newAnimeRating || ''}
//                     onChange={(e) => setNewAnimeRating(e.target.value)}
//                     required
//                 />
//                 <button type="submit" disabled={isSubmitting}>
//                     {isSubmitting ? 'Adding...' : 'Add Anime to History'}
//                 </button>
//             </form>
//         </div>
//     );
// }

// export default UserProfileEditor;


// frontend/src/components/UserProfileEditor.jsx (CORRECTED: Removed Manual Authorization Header)
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './UserProfileEditor.css'; // Add a CSS file for styling

const API_BASE_URL = 'http://localhost:3001/api/users/profile';
const GENRES = ["Action", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Romance", "Horror", "Slice of Life", "Adventure", "Supernatural"];

function UserProfileEditor() {
    const { user, isAuthenticated } = useAuth(); // Removed 'token' from destructuring since it's not needed
    
    // --- State for Genre Selection ---
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [dislikedGenres, setDislikedGenres] = useState([]);
    
    // --- State for Watch History Input ---
    const [newAnimeTitle, setNewAnimeTitle] = useState('');
    const [newAnimeRating, setNewAnimeRating] = useState(null);
    
    // --- UI State ---
    const [message, setMessage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handles toggling a genre as "favorite"
    const handleGenreToggle = (genre) => {
        setSelectedGenres(prev => 
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
        // Ensure genre is removed from disliked if it's favorited
        setDislikedGenres(prev => prev.filter(g => g !== genre));
    };

    // Handles toggling a genre as "disliked"
    const handleDislikeToggle = (genre) => {
        setDislikedGenres(prev => 
            prev.includes(genre)
                ? prev.filter(g => g !== genre)
                : [...prev, genre]
        );
        // Ensure genre is removed from favorited if it's disliked
        setSelectedGenres(prev => prev.filter(g => g !== genre));
    };

    // Handles the primary update request (PUT)
    const handleUpdatePreferences = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || isSubmitting) return;

        setIsSubmitting(true);
        setMessage(null);

        try {
            const payload = {};

            // Only include non-empty arrays to avoid overriding entire lists in the DB
            if (selectedGenres.length > 0) {
                payload.favorite_genres = selectedGenres;
            }
            if (dislikedGenres.length > 0) {
                payload.disliked_genres = dislikedGenres;
            }
            
            // CRITICAL FIX: Removed manual 'Authorization' header to rely on cookie.
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const response = await axios.put(API_BASE_URL, payload, config);

            setMessage(response.data.message || 'Preferences updated successfully!');
            // Clear temporary selection states
            setSelectedGenres([]);
            setDislikedGenres([]);

        } catch (error) {
            console.error("Update Preferences Error:", error.response?.data || error);
            setMessage(error.response?.data?.message || 'Error updating preferences. Check server status.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // Handles adding a single item to watch history
    const handleAddHistory = async (e) => {
        e.preventDefault();
        if (!isAuthenticated || isSubmitting || !newAnimeTitle.trim() || !newAnimeRating) return;
        
        setIsSubmitting(true);
        setMessage(null);

        try {
            const payload = {
                add_to_watch_history: {
                    anime_title: newAnimeTitle.trim(),
                    rating: parseInt(newAnimeRating)
                }
            };
            
            // CRITICAL FIX: Removed manual 'Authorization' header to rely on cookie.
            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            await axios.put(API_BASE_URL, payload, config);

            setMessage(`Added "${newAnimeTitle}" to history!`);
            // Clear input fields
            setNewAnimeTitle('');
            setNewAnimeRating(null);

        } catch (error) {
            console.error("Add History Error:", error.response?.data || error);
            setMessage(error.response?.data?.message || 'Error adding to history. Check rating bounds.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return <div className="profile-message">Please log in to edit your preferences and history.</div>;
    }
    
    return (
        <div className="profile-editor-container">
            <h2>{user.username}'s Anime Profile</h2>
            
            {message && <p className={`status-message ${message.startsWith('Error') ? 'error' : 'success'}`}>{message}</p>}
            
            {/* 1. Genre Preferences Form */}
            <form onSubmit={handleUpdatePreferences} className="form-section">
                <h3>1. Update Favorite Genres</h3>
                <div className="genre-grid">
                    {GENRES.map(genre => (
                        <button
                            key={genre}
                            type="button"
                            onClick={() => handleGenreToggle(genre)}
                            className={`genre-button ${selectedGenres.includes(genre) ? 'favorite' : ''} ${dislikedGenres.includes(genre) ? 'disliked' : ''}`}
                            disabled={isSubmitting}
                        >
                            {genre}
                            {selectedGenres.includes(genre) ? ' ⭐' : ''}
                            {dislikedGenres.includes(genre) ? ' ❌' : ''}
                        </button>
                    ))}
                </div>
                <div className="current-selection">
                    <p>Favorite (will be added): <strong>{selectedGenres.join(', ') || 'None'}</strong></p>
                    <p>Disliked (will be added): <strong>{dislikedGenres.join(', ') || 'None'}</strong></p>
                </div>
                <button type="submit" disabled={isSubmitting || (selectedGenres.length === 0 && dislikedGenres.length === 0)}>
                    {isSubmitting ? 'Saving...' : 'Save New Genres'}
                </button>
            </form>
            
            {/* 2. Watch History Form */}
            <form onSubmit={handleAddHistory} className="form-section">
                <h3>2. Add to Watch History</h3>
                <input
                    type="text"
                    placeholder="Anime Title (e.g., Bleach)"
                    value={newAnimeTitle}
                    onChange={(e) => setNewAnimeTitle(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Your Rating (1-10)"
                    min="1"
                    max="10"
                    value={newAnimeRating || ''}
                    onChange={(e) => setNewAnimeRating(e.target.value)}
                    required
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add Anime to History'}
                </button>
            </form>
        </div>
    );
}

export default UserProfileEditor;