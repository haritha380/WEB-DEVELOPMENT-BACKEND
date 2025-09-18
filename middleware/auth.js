const jwt = require('jsonwebtoken');
const User = require('../Model/User');

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware to verify JWT token - OWASP A01:2021 Fix
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No authentication token provided.'
            });
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
        
        // Add user to request object
        req.user = user;
        next();
        
    } catch (error) {
        console.error('Authentication error:', error.message);
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }
};

// Middleware to check if user can access/modify specific user data
const authorizeUser = (req, res, next) => {
    try {
        const requestedUserId = req.params.id;
        const currentUserId = req.user._id.toString();
        
        // Check if user is trying to access their own data or if they're admin
        if (currentUserId !== requestedUserId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only access your own data.'
            });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Authorization error.'
        });
    }
};

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

// Function to generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId: userId },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
};

module.exports = {
    authenticateToken,
    authorizeUser,
    requireAdmin,
    generateToken,
    JWT_SECRET
};
