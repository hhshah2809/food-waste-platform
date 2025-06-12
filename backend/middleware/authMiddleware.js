const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Import your User model

const authMiddleware = async (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.header("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false,
      error: "Access denied. Please provide a valid Bearer token." 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user still exists in database
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found. Token is invalid." 
      });
    }
    
    // 4. Attach user to request object
    req.user = user;
    next();
    
  } catch (err) {
    // 5. Handle specific JWT errors
    let errorMessage = "Invalid token";
    let statusCode = 401;
    
    if (err.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
      statusCode = 403; // Forbidden
    } else if (err.name === "JsonWebTokenError") {
      errorMessage = "Invalid token format";
    }
    
    res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

module.exports = authMiddleware;