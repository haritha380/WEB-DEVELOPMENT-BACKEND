const express = require("express");
const router = express.Router();
const UserController = require("../Controllers/UserController");
const { validateUser, validateLogin } = require("../middleware/validation");
const { authenticateToken, authorizeUser, requireAdmin } = require("../middleware/auth");

// Public routes (no authentication required)
router.post("/", validateUser, UserController.addUsers);           // User registration
router.post("/login", validateLogin, UserController.loginUser);    // User login

// Protected routes (authentication required) - OWASP A01:2021 Fix
router.get("/", authenticateToken, requireAdmin, UserController.getAllUsers);        // Only admins can see all users
router.get("/:id", authenticateToken, authorizeUser, UserController.getById);        // Users can only see their own data
router.put("/:id", authenticateToken, authorizeUser, UserController.updateUser);     // Users can only update their own data
router.delete("/:id", authenticateToken, authorizeUser, UserController.deleteUser);  // Users can only delete their own account

// Checkout route (authentication required)
router.post("/checkout", authenticateToken, UserController.addBoughtShows);

module.exports = router;
