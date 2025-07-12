require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const morgan = require('morgan');

const foodWasteRoutes = require('./routes/food-waste');
const userRoutes = require('./routes/user');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();

// 1. Security Middlewares
app.use(helmet()); // Secure headers
app.use(mongoSanitize()); // Sanitize data against query injection
app.use(hpp()); // Protect against HTTP Parameter Pollution
console.log(typeof(authMiddleware));

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// 3. Enable CORS with specific options
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 4. Body Parser
app.use(express.json({ limit: '10kb' })); // Limit body size to 10kb

// 5. Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 6. Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
      
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1); // Exit process with failure
  }
};
connectDB();

// 7. Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Food Waste Reduction Platform API is running',
    version: '1.0.0'
  });
});

// Public routes
app.use('/api/users', userRoutes);

// Protected routes
// ✅ Correct

// ✅ CORRECT - let routes decide which ones need auth
app.use("/api/food-waste", foodWasteRoutes);

// 8. Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 9. Handle 404
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// 10. Server Setup
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('🔥 Unhandled Rejection:', err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; // For testing purposes