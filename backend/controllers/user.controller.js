
// // backend/controllers/user.controller.js

// const User = require('../models/User'); 
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// // --- Helper function to handle token generation ---
// const createToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: '1d' 
//     });
// };

// // =================================================================
// // USER REGISTRATION (SIGNUP) - Now uses the HTTP-Only cookie logic
// // =================================================================
// exports.signup = async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists with that email.' });
//         }

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);

//         user = new User({
//             username,
//             email,
//             password: hashedPassword,
//         });

//         await user.save();

//         const token = createToken(user._id);
        
//         // 5. Set HTTP-only cookie and send minimal data back
//         res.cookie('jwt', token, { 
//             maxAge: 24 * 60 * 60 * 1000, 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'Lax', 
//         });

//         res.status(201).json({
//             message: 'User registered successfully!',
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//             },
//             // Token is now in the cookie, not the body
//         });

//     } catch (error) {
//         console.error('Signup Error:', error);
//         // Handle MongoDB duplicate key error for unique fields
//         if (error.code === 11000) {
//              return res.status(400).json({ message: 'Username or Email already in use.' });
//         }
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// };

// // =================================================================
// // USER LOGIN - Now uses the HTTP-Only cookie logic
// // =================================================================
// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: 'Invalid Credentials.' });
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(400).json({ message: 'Invalid Credentials.' });
//         }

//         const token = createToken(user._id);
        
//         // 4. Set HTTP-only cookie and send minimal data back
//         res.cookie('jwt', token, { 
//             maxAge: 24 * 60 * 60 * 1000, 
//             httpOnly: true, 
//             secure: process.env.NODE_ENV === 'production', 
//             sameSite: 'Lax', 
//         });

//         res.status(200).json({
//             message: 'Login successful!',
//             user: {
//                 id: user._id,
//                 username: user.username,
//                 email: user.email,
//             },
//             // Token is now in the cookie
//         });

//     } catch (error) {
//         console.error('Login Error:', error);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// };

// // =================================================================
// // LOGOUT - Clears the HTTP-only cookie
// // =================================================================
// exports.logout = (req, res) => {
//     res.cookie('jwt', '', {
//         maxAge: 1, // Set maxAge to 1ms to clear the cookie immediately
//         httpOnly: true,
//         secure: process.env.NODE_ENV === 'production',
//         sameSite: 'Lax',
//     });
//     res.status(200).json({ message: 'Logged out successfully.' });
// };

// // =================================================================
// // UPDATE USER PROFILE & PREFERENCES (PUT /api/users/profile)
// // =================================================================
// exports.updateUserProfile = async (req, res) => {
//     // req.userId is guaranteed to be present and valid if the authMiddleware passed
//     const userId = req.userId; 
    
//     // Data received from the frontend
//     const { 
//         favorite_genres, 
//         disliked_genres, 
//         add_to_watch_history 
//     } = req.body;

//     if (!userId) {
//         return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
//     }

//     // Build the Mongoose update object
//     const updateQuery = { $addToSet: {} }; // Use $addToSet to prevent duplicate array entries
    
//     try {
//         if (favorite_genres && favorite_genres.length > 0) {
//             updateQuery.$addToSet['preferences.favorite_genres'] = { $each: favorite_genres };
//         }
//         if (disliked_genres && disliked_genres.length > 0) {
//             updateQuery.$addToSet['preferences.disliked_genres'] = { $each: disliked_genres };
//         }

//         if (add_to_watch_history) {
//             // Use $push for watch history as timestamps and order are important
//             updateQuery.$push = { 
//                 'watch_history': {
//                     anime_title: add_to_watch_history.anime_title,
//                     rating: add_to_watch_history.rating,
//                     watched_on: new Date()
//                 }
//             };
//         }

//         // Remove $addToSet if it ended up empty
//         if (Object.keys(updateQuery.$addToSet).length === 0) {
//             delete updateQuery.$addToSet;
//         }

//         // Perform the atomic update operation
//         const updatedUser = await User.findByIdAndUpdate(
//             userId,
//             updateQuery,
//             { 
//                 new: true, // Return the new, updated document
//                 runValidators: true // Ensure Mongoose schema validation runs on the update
//             }
//         ).select('-password'); // Exclude the sensitive password field

//         if (!updatedUser) {
//             return res.status(404).json({ message: 'User not found.' });
//         }

//         res.status(200).json({
//             message: 'Profile updated successfully. Changes will be used in your next recommendation!',
//             user: {
//                 id: updatedUser._id,
//                 username: updatedUser.username,
//                 preferences: updatedUser.preferences,
//             }
//         });

//     } catch (error) {
//         console.error('Update Profile Error:', error);
//         // Handle validation errors (e.g., if a rating is outside 1-10)
//         if (error.name === 'ValidationError') {
//             return res.status(400).json({ message: error.message });
//         }
//         res.status(500).json({ message: 'Server error during profile update.' });
//     }
// };

// backend/controllers/user.controller.js

const User = require('../models/User'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const mongoose = require('mongoose'); // Included for completeness

dotenv.config();

// --- Helper function to handle token generation ---
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d' 
    });
};

// --- CRITICAL COOKIE OPTIONS FOR DEPLOYMENT ---
const cookieOptions = {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true, 
    path: '/',
    // CRITICAL FIX: 'Secure: true' is required for SameSite=None
    secure: process.env.NODE_ENV === 'production', 
    // CRITICAL FIX: Must be 'None' for cross-site cookie transmission (Netlify to Render)
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
};


// =================================================================
// USER REGISTRATION (SIGNUP)
// =================================================================
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with that email.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        const token = createToken(user._id);
        
        // 5. Set HTTP-only cookie using the updated options
        res.cookie('jwt', token, cookieOptions);

        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Signup Error:', error);
        if (error.code === 11000) {
             return res.status(400).json({ message: 'Username or Email already in use.' });
        }
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// =================================================================
// USER LOGIN
// =================================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        const token = createToken(user._id);
        
        // 4. Set HTTP-only cookie using the updated options
        res.cookie('jwt', token, cookieOptions);

        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};

// =================================================================
// LOGOUT - Clears the HTTP-only cookie
// =================================================================
exports.logout = (req, res) => {
    // Note: Use a cleared version of cookieOptions for logout
    res.cookie('jwt', '', {
        maxAge: 1, 
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
        path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully.' });
};

// =================================================================
// UPDATE USER PROFILE & PREFERENCES (PUT /api/users/profile)
// =================================================================
exports.updateUserProfile = async (req, res) => {
    const userId = req.userId; 
    
    const { 
        favorite_genres, 
        disliked_genres, 
        add_to_watch_history 
    } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized. User ID not found.' });
    }

    // Build the Mongoose update object
    const updateQuery = { $addToSet: {} }; 
    
    try {
        if (favorite_genres && favorite_genres.length > 0) {
            updateQuery.$addToSet['preferences.favorite_genres'] = { $each: favorite_genres };
        }
        if (disliked_genres && disliked_genres.length > 0) {
            updateQuery.$addToSet['preferences.disliked_genres'] = { $each: disliked_genres };
        }

        if (add_to_watch_history) {
            updateQuery.$push = { 
                'watch_history': {
                    anime_title: add_to_watch_history.anime_title,
                    rating: add_to_watch_history.rating,
                    watched_on: new Date()
                }
            };
        }

        // Remove $addToSet if it ended up empty
        if (Object.keys(updateQuery.$addToSet).length === 0) {
            delete updateQuery.$addToSet;
        }
        
        // Handle $push check
        if (Object.keys(updateQuery).length === 0 && !updateQuery.$push) {
            return res.status(400).json({ message: 'No valid data provided for update.' });
        }
        
        // Perform the atomic update operation
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateQuery,
            { 
                new: true, 
                runValidators: true 
            }
        ).select('-password'); 

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'Profile updated successfully. Changes will be used in your next recommendation!',
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                preferences: updatedUser.preferences,
            }
        });

    } catch (error) {
        console.error('Update Profile Error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during profile update.' });
    }
};

// =================================================================
// DYNAMIC RECOMMENDATIONS API (Placeholder)
// =================================================================
exports.getDynamicRecommendations = async (req, res) => {
    return res.status(501).json({ message: "Recommendation feature is under construction." });
};