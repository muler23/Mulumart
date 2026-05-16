// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');
const ErrorResponse = require('../utils/errorResponse');

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: new ErrorResponse('Too many login attempts, please try again after 15 minutes', 429)
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: new ErrorResponse('Too many requests, please try again later', 429)
});

module.exports = {
  loginLimiter,
  apiLimiter
};