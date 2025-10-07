// // backend/middleware/requireAuth.js (STRICT Authentication)
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// /**
//  * Middleware that strictly enforces a valid JWT token. 
//  * Rejects the request with a 401 Unauthorized status if the token is missing or invalid.
//  */
// const requireAuth = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     let token = authHeader ? authHeader.split(' ')[1] : null;

//     // IMPORTANT: Check for the token in the HTTP-Only cookie 
//     // (Ensure you have 'cookie-parser' setup in your main app.js)
//     if (!token && req.cookies && req.cookies.jwt) {
//         token = req.cookies.jwt;
//     }

//     if (!token) {
//         // STRICT FAILURE: No token found.
//         return res.status(401).json({ message: 'Authentication required. No access token provided.' });
//     }

//     try {
//         // 2. Verify the token (using the secret defined in your .env)
//         const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

//         // 3. Attach the userId (ID was stored as 'id' in your payload)
//         req.userId = decodedToken.id; 
        
//         // 4. Token is valid, proceed to the controller!
//         next();

//     } catch (error) {
//         // STRICT FAILURE: Token is invalid (e.g., expired, expired, tampered).
//         console.warn('Strict Auth Failure:', error.message);
//         return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
//     }
// };

// module.exports = requireAuth;

// backend/middleware/requireAuth.js (FINAL ROBUST AUTH)

const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const requireAuth = (req, res, next) => {
    
    // 1. Prioritize the SECURE HTTP-ONLY COOKIE if present
    let token = req.cookies?.jwt; 

    // 2. Fallback: Check the Authorization header ONLY if no cookie was found
    if (!token) {
        const authHeader = req.headers.authorization;
        token = authHeader?.split(' ')[1];
    }
    
    // Diagnostic Logs (Keep these for confirmation)
    console.log("[StrictAuth] JWT in cookies:", req.cookies?.jwt ? 'FOUND' : 'NOT FOUND');
    console.log("[StrictAuth] Auth Header status:", req.headers.authorization ? 'PRESENT' : 'MISSING');
    

    if (!token) {
        // REJECTED: No token found.
        return res.status(401).json({ message: 'Authentication required. No access token provided.' });
    }

    try {
        // 3. Verify the token (This will be the cookie token if both are present and the header is malformed)
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id; 
        console.log(`[StrictAuth] SUCCESS: Token verified for User ID: ${req.userId}`);
        
        next();

    } catch (error) {
        // This catches malformed/expired tokens.
        console.warn('Strict Auth Failure (401):', error.message);
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

module.exports = requireAuth;