const express = require('express');
const router = express.Router();
const {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getBuildings,
} = require('../controllers/spaceController');
const { getSpaceSeats, saveSpaceLayout } = require('../controllers/seatController');
const { getPrediction } = require('../controllers/predictionController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/adminMiddleware');

router.get('/meta/buildings', getBuildings);
router.get('/', optionalAuth, getSpaces);
router.get('/:id', optionalAuth, getSpaceById);
router.post('/', protect, requireAdmin, createSpace);
router.put('/:id', protect, requireAdmin, updateSpace);
router.delete('/:id', protect, requireAdmin, deleteSpace);

// Seating sub-routes
router.get('/:id/seats', getSpaceSeats);
router.post('/:id/layout', protect, requireAdmin, saveSpaceLayout);

// Prediction sub-route
router.get('/:id/prediction', getPrediction);

module.exports = router;
