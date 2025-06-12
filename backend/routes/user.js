const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validator = require("validator");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
// Add this line below other imports
// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Name, email and password are required." 
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ 
        success: false,
        error: "Please provide a valid email address." 
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        success: false,
        error: "Password must be at least 8 characters long." 
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        error: "User already exists.",
        suggestion: "Try logging in or use a different email address." 
      });
    }

    // Create new user (password will be hashed by the model's pre-save hook)
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password,
      phone
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );

    // Omit password in response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true,
      token,
      user: userResponse,
      message: "User registered successfully." 
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ 
      success: false,
      error: "Registration failed.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: "Email and password are required." 
      });
    }

    // Find user (case insensitive) and include password field
    const user = await User.findOne({ email: email.toLowerCase() })
                          .select("+password");

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials.",
        suggestion: "Check your email or register for an account." 
      });
    }

    // Verify password using model method
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: "Invalid credentials.",
        suggestion: "Forgot password? Consider resetting it." 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );

    // Omit password in response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse,
      message: "Logged in successfully."
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ 
      success: false,
      error: "Login failed.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get current user profile (protected route)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found." 
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch profile." 
    });
  }
});

module.exports = router;