const jwt = require("jsonwebtoken");
const User = require("../models/user");  // Add this to verify user existence

const protect = async (req, res, next) => {  // Make it async
  let token;
  
  // 1. Get token from header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ 
      error: "Access denied. Please provide a token." 
    });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.userId);
    if (!currentUser) {
      return res.status(401).json({ 
        error: "The user belonging to this token no longer exists." 
      });
    }
    
    // 4. Add user to request
    req.user = currentUser;
    next();
    
  } catch (error) {
    // Handle different JWT errors specifically
    let errorMessage = "Invalid token";
    if (error.name === "TokenExpiredError") {
      errorMessage = "Token expired. Please log in again.";
    } else if (error.name === "JsonWebTokenError") {
      errorMessage = "Token malformed";
    }
    
    res.status(401).json({ 
      error: errorMessage,
      details: error.message  // Useful for debugging
    });
  }
};

module.exports = protect;