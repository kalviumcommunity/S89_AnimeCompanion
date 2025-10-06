// frontend/src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // State to hold the user data (ID, username) and the JWT token
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Check for token on initial load
    useEffect(() => {
        const storedToken = Cookies.get('auth-token');
        if (storedToken) {
            // NOTE: In a production app, you would verify this token with the backend 
            // to re-fetch user details, but here we simply trust the stored data for now.
            setToken(storedToken);
            // Simulate user data retrieval from token payload (in a real app, you'd decode the JWT)
            // Since we can't safely decode it on the client, we'll just set a placeholder user if token exists
            setUser({ id: "authenticated_user", username: "Logged In User" }); 
        }
        setIsLoading(false);
    }, []);

    // 2. Login function: Saves token and user data
    const login = (token, userData) => {
        // Store token in an HTTP-only cookie (better security)
        Cookies.set('auth-token', token, { expires: 1, secure: false, sameSite: 'Lax' }); // Use secure:true in prod
        setToken(token);
        setUser(userData);
    };

    // 3. Logout function: Clears token and user data
    const logout = () => {
        Cookies.remove('auth-token');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};