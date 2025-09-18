const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./Routes/UserRoutes');
const showRoutes = require('./Routes/ShowRoutes');

const app = express();

// MongoDB Connection
const DB_URL = "mongodb+srv://bandaraindika488:bandaraindika488@wanderlust.dxicvrx.mongodb.net/?retryWrites=true&w=majority&appName=wanderlust"
// Security Middleware - OWASP A05:2021 Fix
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate Limiting - OWASP A05:2021 Fix
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use(limiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: {
        success: false,
        message: 'Too many login attempts, please try again later.'
    }
});

// Basic Middleware
app.use(express.json({ limit: '10mb' })); // Limit payload size
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Restrict CORS
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/users', userRoutes);
app.use('/api/shows', showRoutes);
app.use('/uploads', express.static('uploads'));

// Apply auth rate limiting to login endpoint
app.use('/users/login', authLimiter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Music Festival API is running!', 
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware - OWASP A05:2021 Fix
app.use((err, req, res, next) => {
    // Don't leak sensitive error information
    console.error('Error:', err.message);
    
    // Log security events
    if (err.status === 401 || err.status === 403) {
        console.warn(`Security Event: ${req.ip} - ${err.message}`);
    }
    
    res.status(err.status || 500).json({
        success: false,
        message: 'Internal server error',
        // Only show detailed errors in development
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`
    });
});

// MongoDB connection and server start
mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
}).then(() => {
    console.log('✅ Connected to MongoDB Atlas successfully!');
    
    const server = app.listen(5000, '127.0.0.1', () => {
        console.log('🚀 Server running on http://127.0.0.1:5000');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully');
        server.close(() => {
            mongoose.connection.close();
            process.exit(0);
        });
    });
    
}).catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

module.exports = app;
