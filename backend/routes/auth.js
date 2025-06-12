const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const validator = require("validator");
const router = express.Router();

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body;
  
  try {
    // Validate input
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        error: "User already exists.",
        suggestion: "Try logging in or use a different email address."
      });
    }

    // Create new user
    const user = await User.create({ 
      name, 
      email: email.toLowerCase(), 
      password,
      phone
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );

    // Omit password in response
    const userResponse = { ...user._doc };
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
      return res.status(400).json({ error: "Please provide email and password." });
    }

    // Find user (case insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return res.status(401).json({ 
        error: "Invalid credentials.",
        suggestion: "Check your email or register for an account."
      });
    }

    // Verify password
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: "Invalid credentials.",
        suggestion: "Forgot password? Consider resetting it."
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "1h" }
    );

    // Omit password in response
    const userResponse = { ...user._doc };
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
      error: "Login failed.",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

module.exports = router;