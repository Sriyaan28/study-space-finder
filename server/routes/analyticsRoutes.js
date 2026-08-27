const express = require('express');
const router = express.Router();
const {
  getStudentStats,
  getAdminStats,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/student', protect, getStudentStats);
router.get('/admin', protect, requireAdmin, getAdminStats);

module.exports = router;
