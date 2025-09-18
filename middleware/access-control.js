const jwt = require('jsonwebtoken');
const User = require('../Model/User');

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token - OWASP A01:2021 Fix
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });lo
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        req.user = user; // Add user to request object
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Middleware to check if user can access/modify specific user data - OWASP A01:2021 Fix
const authorizeUserAccess = (req, res, next) => {
    const requestedUserId = req.params.id;
    const currentUserId = req.user._id.toString();

    // Check if user is trying to access their own data OR is admin
    if (currentUserId !== requestedUserId && !req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. You can only access your own data.'
        });
    }

    next();
};

// Middleware to check admin access - OWASP A01:2021 Fix
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeUserAccess,
    requireAdmin,
    JWT_SECRET
};
