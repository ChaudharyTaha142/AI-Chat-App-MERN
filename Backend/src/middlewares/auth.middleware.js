const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');

async function authUser(req, res, next) {
    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- THIS IS THE FIX ---
        // The token payload has 'userId', not 'id'.
        // We must use the correct key to find the user.
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
        }

        const user = await userModel.findById(decoded.userId).lean(); // Use .lean() for performance

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Attach the user object to the request for other routes to use
        req.user = user;

        next();

    } catch (err) {
        // This will catch errors like expired tokens or malformed tokens
        console.error("Auth Middleware Error:", err.message);
        return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
}

module.exports = {
    authUser
};