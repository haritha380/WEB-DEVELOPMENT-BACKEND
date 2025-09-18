const User = require("../Model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Don't send passwords
        return res.status(200).json({
            success: true,
            count: users.length,
            users
        });
    } catch (err) {
        console.error('Get all users error:', err);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching users"
        });
    }
};

const addUsers = async (req, res) => {
    const { name, nic, email, password, country, gender, language, profilepicture } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password before saving - OWASP A02:2021 Fix
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new User({ 
            name, 
            nic, 
            email, 
            password: hashedPassword, // Store hashed password
            country, 
            gender, 
            language, 
            profilepicture 
        });
        
        await user.save();
        
        // Don't send password in response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: userResponse
        });
    } catch (err) {
        console.error('Add user error:', err);
        
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        return res.status(500).json({
            success: false,
            message: "Unable to add user"
        });
    }
};

const getById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            user
        });
    } catch (err) {
        console.error('Get user by ID error:', err);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            user
        });
    } catch (err) {
        console.error('Update user error:', err);
        return res.status(500).json({
            success: false,
            message: "Unable to update user"
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        console.error('Delete user error:', err);
        return res.status(500).json({
            success: false,
            message: "Unable to delete user"
        });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        // Find user by email only - OWASP A02:2021 Fix
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        // Compare hashed password - OWASP A02:2021 Fix
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }
        
        // Generate JWT token - OWASP A01:2021 Fix
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Don't send password in response
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.status(200).json({
            success: true,
            message: "Login successful",
            user: userResponse,
            token: token  // Send JWT token to client
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};

const addBoughtShows = async (req, res) => {
    const { userId, cartItems } = req.body;

    if (!userId || !cartItems || !cartItems.length) {
        return res.status(400).json({ success: false, message: "User ID and cart items are required" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        cartItems.forEach(item => {
            user.boughtShows.push({
                showId: item._id,
                artistName: item.name,
                time: item.time,
                location: item.location,
                price: item.price,
                quantity: item.quantity,
                imageUrl: item.image
            });
        });

        await user.save();
        return res.status(200).json({ success: true, boughtShows: user.boughtShows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    loginUser,
    getAllUsers,
    addUsers,
    getById,
    updateUser,
    deleteUser,
    addBoughtShows
};

