const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Error handler for async functions
const catchAsync = fn => (req, res, next) => {
  fn(req, res, next).catch(next);
};

// Protect routes - user must be logged in
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token from cookies or Authorization header
  let token;
  
  // Check cookies first
  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } 
  // Fallback to Authorization header
  else if (req.headers?.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to access this resource'
    });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Check if user still exists
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists'
      });
    }

    // 4. Check if user changed password after token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'User recently changed password. Please log in again'
      });
    }

    // 5. Grant access to protected route
    req.user = currentUser;
    res.locals.user = currentUser; // For templates if needed
    next();
  } catch (err) {
    // Handle different JWT errors specifically
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please log in again'
      });
    }
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your session has expired. Please log in again'
      });
    }

    // For other errors
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
});

// Role-based authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'staff']. role='user'
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

// Check if user is logged in (for frontend)
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies?.jwt) {
    try {
      // 1. Verify token
      const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

      // 2. Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3. Check if user changed password after token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // 4. There is a logged in user
      res.locals.user = currentUser;
    } catch (err) {
      // Don't throw error, just continue without user
      return next();
    }
  }
  next();
});
