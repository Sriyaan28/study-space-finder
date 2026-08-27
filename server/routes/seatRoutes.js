const express = require('express');
const router = express.Router();
const {
  createSeat,
  updateSeat,
  deleteSeat,
} = require('../controllers/seatController');
const { protect } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.post('/', protect, requireAdmin, createSeat);
router.put('/:id', protect, requireAdmin, updateSeat);
router.delete('/:id', protect, requireAdmin, deleteSeat);

module.exports = router;
