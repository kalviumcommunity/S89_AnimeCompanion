// // backend/middleware/authMiddleware.js
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// const authMiddleware = (req, res, next) => {
//     // 1. Get the token from the header
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         // If no token, or token is not in "Bearer <token>" format, proceed but without a user ID
//         // NOTE: We allow unauthenticated users to chat, but with no personalization (userId = null)
//         req.userId = null;
//         return next();
//     }

//     // Extract the token string (remove "Bearer ")
//     const token = authHeader.split(' ')[1];

//     try {
//         // 2. Verify the token using the secret key
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

//         // 3. Attach the userId to the request object
//         // The ID was stored as the 'id' property in your user.controller.js's createToken payload
//         req.userId = decodedToken.id; 
        
//         // 4. Proceed to the next middleware/controller
//         next();

//     } catch (error) {
//         // If the token is invalid (expired, tampered), treat the request as unauthenticated
//         req.userId = null;
//         console.warn('Invalid or expired JWT detected:', error.message);
//         return next(); // Still proceed, allowing general chat features
//     }
// };

// module.exports = authMiddleware;

// backend/middleware/permissiveAuth.js (FINAL, CLEANED VERSION)
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const permissiveAuth = (req, res, next) => { 
    // 1. Prioritize the secure HTTP-only cookie
    let token = req.cookies?.jwt; 

    // If a developer is using a tool (like Postman) or a different flow, 
    // check the Authorization header as a secondary option.
    if (!token) {
        const authHeader = req.headers.authorization;
        token = authHeader?.split(' ')[1];
    }
    
    if (!token) {
        // Proceed unauthenticated
        req.userId = null;
        return next(); 
    }

    try {
        // 2. Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id; 
        
        // 3. Proceed authenticated
        next();

    } catch (error) {
        // Token is expired/invalid. Proceed unauthenticated.
        req.userId = null;
        console.warn(`[PermissiveAuth] Invalid JWT: ${error.message}. Proceeding unauthenticated.`);
        return next(); 
    }
};

module.exports = permissiveAuth;