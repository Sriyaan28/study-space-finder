const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const inMemoryStore = require('../services/inMemoryStore');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_university_study_space_key_2026', {
    expiresIn: '30d',
  });
};

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (isDbConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
        role: role === 'admin' ? 'admin' : 'student',
        department: department || 'General Studies',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
          studentId: user.studentId,
          avatar: user.avatar,
        },
      });
    }

    // In-Memory Mode
    const userExists = inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `usr_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'student',
      status: 'active',
      department: department || 'General Studies',
      studentId: `STU-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date(),
    };

    inMemoryStore.users.push(newUser);
    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        department: newUser.department,
        studentId: newUser.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    if (isDbConnected()) {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password.' });
      }

      if (user.status === 'blocked') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been suspended by campus administration. Please contact support.',
          isBlocked: true,
        });
      }

      const token = generateToken(user._id);

      return res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          department: user.department,
          studentId: user.studentId,
          avatar: user.avatar,
        },
      });
    }

    // In-Memory Mode
    const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by campus administration.',
        isBlocked: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        studentId: user.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      return res.json({ success: true, user });
    }

    const user = inMemoryStore.users.find((u) => u._id === req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      user.name = req.body.name || user.name;
      user.department = req.body.department || user.department;
      user.avatar = req.body.avatar || user.avatar;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      return res.json({ success: true, user: updatedUser });
    }

    const userIndex = inMemoryStore.users.findIndex((u) => u._id === req.user._id);
    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found.' });

    const u = inMemoryStore.users[userIndex];
    u.name = req.body.name || u.name;
    u.department = req.body.department || u.department;
    if (req.body.password) {
      u.password = await bcrypt.hash(req.body.password, 10);
    }
    inMemoryStore.users[userIndex] = u;

    res.json({ success: true, user: u });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
