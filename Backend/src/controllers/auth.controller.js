const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Registers a new user, creates a JWT, and sends it as a cookie.
 */
async function registerUser(req, res) {
    try {
        const { fullName: { firstName, lastName }, email, password } = req.body;

        const isUserAlreadyExists = await userModel.findOne({ email });

        if (isUserAlreadyExists) {
            // Use 409 Conflict for existing resources
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = await userModel.create({
            fullName: {
                firstName,
                lastName
            },
            email,
            password: hashPassword
        });

        // --- THE FIX ---
        // Create the token with 'userId' to match the socket middleware.
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Best practice: add an expiration time
        );

        // Best practice: set cookie with httpOnly for better security
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict'
        });

        res.status(201).json({
            message: "User registered successfully",
            user: {
                email: user.email,
                _id: user.id, // Use .id virtual getter for consistency
                fullName: user.fullName
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

/**
 * Logs in an existing user, creates a JWT, and sends it as a cookie.
 */
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" }); // Use 401 for auth errors
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" }); // Use 401 for auth errors
        }

        // --- THE FIX ---
        // Create the token with 'userId' to match the socket middleware.
        const token = jwt.sign(
            { userId: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // Best practice: add an expiration time
        );

        // Best practice: set cookie with httpOnly for better security
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'strict'
        });

        res.status(200).json({
            message: "User logged in successfully",
            user: {
                email: user.email,
                _id: user.id,
                fullName: user.fullName
            }
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    registerUser,
    loginUser
};
