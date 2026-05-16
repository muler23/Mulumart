// server.js
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');
const fileupload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const socketio = require('socket.io');
const http = require('http');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database

const connectDB = require('./src/config/db');

// Route files
const auth = require('./src/routes/auth');
const users = require('./src/routes/users');
const ads = require('./src/routes/ads');
const categories = require('./src/routes/categories');
const reviews = require('./src/routes/reviews');
const messages = require('./src/routes/messages');
const chat = require('./src/routes/chat');
const favorites = require('./src/routes/favorites');
const search = require('./src/routes/search');
const notifications = require('./src/routes/notifications');
const admin = require('./src/routes/admin');
const promotions = require('./src/routes/promotions');
const payments = require('./src/routes/payments');
const business = require('./src/routes/business');
const reports = require('./src/routes/reports');

// Error handler
const errorHandler = require('./src/middleware/error');

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Sanitize data (temporarily disabled due to compatibility issue)
// app.use(mongoSanitize());

// File uploading - Using multer instead of express-fileupload
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Note: express-fileupload is removed to avoid conflicts with multer

// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Prevent XSS attacks (temporarily disabled due to compatibility issue)
// app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: process.env.NODE_ENV === 'development' ? 1000 : 100, // More lenient for development
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Dedicated uploads route with CORS
app.get('/uploads/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  
  // Set CORS headers for images
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Send file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('File not found:', filePath);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Dedicated uploads route for subdirectories
app.get('/uploads/:subdir/:filename', (req, res) => {
  const { subdir, filename } = req.params;
  const filePath = path.join(__dirname, 'public', 'uploads', subdir, filename);
  
  // Set CORS headers for images
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'false');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Send file
  res.sendFile(filePath, (err) => {
    if (err) {
      console.log('File not found:', filePath);
      res.status(404).json({ error: 'File not found' });
    }
  });
});

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/ads', ads);
app.use('/api/v1/categories', categories);
app.use('/api/v1/reviews', reviews);
app.use('/api/v1/messages', messages);
app.use('/api/v1/favorites', favorites);
app.use('/api/v1/search', search);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/admin', admin);
app.use('/api/v1/promotions', promotions);
app.use('/api/v1/payments', payments);
app.use('/api/v1/business', business);
app.use('/api/v1/reports', reports);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Set up Socket.io with enhanced service
const SocketService = require('./src/services/socketService');
const io = socketio(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize SocketService
const socketService = new SocketService(io);

// Initialize Cron Service
const cronService = require('./src/services/cronService');
cronService.initialize();

// Make io accessible to routes
app.set('io', io);