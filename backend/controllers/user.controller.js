// backend/controllers/user.controller.js

const User = require('../models/User'); // Import the User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// NOTE: You must add a JWT_SECRET to your .env file!
// Example: JWT_SECRET="YOUR_SUPER_SECRET_KEY_FOR_JWT"

// --- Helper function to handle token generation ---
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d' // Token expires in 1 day
    });
};

// =================================================================
// USER REGISTRATION (SIGNUP)
// =================================================================
exports.signup = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists with that email.' });
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create new user (using default preferences from the schema)
        user = new User({
            username,
            email,
            password: hashedPassword,
        });

        await user.save();

        // 4. Generate Token (contains user ID)
        const token = createToken(user._id);

        // 5. Respond with user info and token
        res.status(201).json({
            message: 'User registered successfully!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

// =================================================================
// USER LOGIN
// =================================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // 2. Compare Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials.' });
        }

        // 3. Generate Token
        const token = createToken(user._id);

        // 4. Respond with user info and token
        res.status(200).json({
            message: 'Login successful!',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};