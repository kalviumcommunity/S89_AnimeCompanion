// // // backend/routes/user.routes.js

// // const express = require('express');
// // const { signup, login } = require('../controllers/user.controller');
// // const router = express.Router();

// // // POST /api/users/signup
// // router.post('/signup', signup);

// // // POST /api/users/login
// // router.post('/login', login);

// // module.exports = router;

// // backend/routes/user.routes.js (FINAL VERSION)

// const express = require('express');
// const { signup, login, logout, updateUserProfile } = require('../controllers/user.controller'); // <--- IMPORT NEW FUNCTION
// const authMiddleware = require('../middleware/permissiveAuth'); // Import middleware to secure the route
// const router = express.Router();

// // Public Routes
// router.post('/signup', signup);
// router.post('/login', login);
// router.post('/logout', logout);

// // Protected Routes
// // PUT /api/users/profile - Updates genres, adds to history (requires authentication)
// router.put('/profile', authMiddleware, updateUserProfile); // <--- NEW PROTECTED ROUTE

// module.exports = router;


// // backend/routes/user.routes.js (UPDATED FINAL VERSION)

// const express = require('express');
// const { signup, login, logout, updateUserProfile } = require('../controllers/user.controller'); 
// const requireAuth = require('../middleware/requireAuth'); // <-- NEW STRICT MIDDLEWARE
// const router = express.Router();

// // Public Routes
// router.post('/signup', signup);
// router.post('/login', login);
// router.post('/logout', logout);

// // Protected Routes
// // PUT /api/users/profile - MUST use strict authentication
// router.put('/profile', requireAuth, updateUserProfile); 

// module.exports = router;

// backend/routes/user.routes.js (FINAL VERSION - CORRECTED IMPORTS)

const express = require('express');
const { 
    signup, 
    login, 
    logout, 
    updateUserProfile, 
    // CRITICAL FIX: The handler function must be explicitly imported
    getDynamicRecommendations 
} = require('../controllers/user.controller'); 
const requireAuth = require('../middleware/requireAuth'); 
const router = express.Router();

// Public Routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// Protected Routes
// PUT /api/users/profile - Updates user data (Requires strict auth)
router.put('/profile', requireAuth, updateUserProfile); 

// NEW PROTECTED ROUTE: GET /api/users/recommendations
// This is the dedicated endpoint for the recommendation display page (JSON Output).
router.get('/recommendations', requireAuth, getDynamicRecommendations); // Fix implemented by importing above

module.exports = router;