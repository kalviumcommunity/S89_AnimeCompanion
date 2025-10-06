// frontend/src/components/AuthForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://localhost:3001/api/users';

function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        
        const endpoint = isLogin ? `${API_BASE_URL}/login` : `${API_BASE_URL}/signup`;
        
        try {
            const body = { email, password };
            if (!isLogin) {
                // Ensure the username is included for signup
                if (!username.trim()) return setMessage("Username is required for signup.");
                body.username = username;
            }

            const response = await axios.post(endpoint, body);
            
            // On success, save the token and user data to context
            login(response.data.token, response.data.user);
            setMessage(response.data.message);

        } catch (error) {
            console.error('Authentication Error:', error.response?.data);
            setMessage(error.response?.data?.message || 'An error occurred. Check server logs.');
        }
    };

    return (
        <div className="auth-container">
            <h3>{isLogin ? 'Login to Access Personalization' : 'Sign Up for Anime Companion'}</h3>
            <form onSubmit={handleSubmit} className="auth-form">
                {!isLogin && (
                    <input 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required={!isLogin}
                    />
                )}
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                />
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            {message && <p className="auth-message">{message}</p>}
            <button 
                className="toggle-button"
                onClick={() => setIsLogin(!isLogin)}
            >
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
            </button>
        </div>
    );
}

export default AuthForm;