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
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  // 2. Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 3. Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: 'The user belonging to this token no longer exists'
    });
  }

  // 4. Grant access to protected route
  req.user = currentUser;
  next();
});

// Role-based authorization
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
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
  if (req.cookies.jwt) {
    // 1. Verify token
    const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

    // 2. Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }

    // 3. There is a logged in user
    res.locals.user = currentUser;
  }
  next();
});