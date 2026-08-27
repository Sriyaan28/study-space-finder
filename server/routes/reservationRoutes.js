const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReservation);
router.get('/', protect, getMyReservations);
router.get('/:id', protect, getReservationById);
router.delete('/:id', protect, cancelReservation);

module.exports = router;
