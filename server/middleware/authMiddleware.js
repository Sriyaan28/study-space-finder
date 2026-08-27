const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const inMemoryStore = require('../services/inMemoryStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_university_study_space_key_2026');

      let user = null;

      if (isDbConnected()) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = inMemoryStore.users.find((u) => u._id === decoded.id);
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User session expired or user no longer exists.' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration. You cannot access protected resources or make reservations.',
          isBlocked: true,
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_university_study_space_key_2026');
      let user = null;

      if (isDbConnected()) {
        user = await User.findById(decoded.id).select('-password');
      } else {
        user = inMemoryStore.users.find((u) => u._id === decoded.id);
      }

      if (user && user.status !== 'blocked') {
        req.user = user;
      }
    } catch (e) {}
  }
  next();
};

module.exports = { protect, optionalAuth };
