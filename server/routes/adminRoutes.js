const express = require('express');
const router = express.Router();
const { getStudents, blockStudent, unblockStudent } = require('../controllers/adminController');
const { getAllReservations } = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

// All routes here require Admin authentication
router.use(protect, requireAdmin);

router.get('/students', getStudents);
router.patch('/students/:id/block', blockStudent);
router.patch('/students/:id/unblock', unblockStudent);
router.get('/reservations', getAllReservations);

module.exports = router;
