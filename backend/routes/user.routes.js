
// // backend/routes/user.routes.js (FINAL VERSION - CORRECTED IMPORTS)

// const express = require('express');
// const { 
//     signup, 
//     login, 
//     logout, 
//     updateUserProfile, 
//     // CRITICAL FIX: The handler function must be explicitly imported
//     getDynamicRecommendations 
// } = require('../controllers/user.controller'); 
// const requireAuth = require('../middleware/requireAuth'); 
// const router = express.Router();

// // Public Routes
// router.post('/signup', signup);
// router.post('/login', login);
// router.post('/logout', logout);

// // Protected Routes
// // PUT /api/users/profile - Updates user data (Requires strict auth)
// router.put('/profile', requireAuth, updateUserProfile); 

// // NEW PROTECTED ROUTE: GET /api/users/recommendations
// // This is the dedicated endpoint for the recommendation display page (JSON Output).
// router.get('/recommendations', requireAuth, getDynamicRecommendations); // Fix implemented by importing above

// module.exports = router;

// backend/routes/user.routes.js 

const express = require('express');
const { signup, login, logout, updateUserProfile } = require('../controllers/user.controller');
const requireAuth = require('../middleware/requireAuth'); // Use the strict one
const router = express.Router();

// Public Routes (No Auth Required)
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout); // Logout only clears the cookie; doesn't need auth

// Protected Routes (Uses the strict middleware)
router.put('/profile', requireAuth, updateUserProfile); // Update profile requires login
// You should also add a route to GET the profile:
// router.get('/profile', requireAuth, userController.getUserProfile); 

module.exports = router;