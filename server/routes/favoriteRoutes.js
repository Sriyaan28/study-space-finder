const express = require('express');
const router = express.Router();
const {
  getMyFavorites,
  addFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getMyFavorites);
router.post('/:spaceId', protect, addFavorite);
router.delete('/:spaceId', protect, removeFavorite);

module.exports = router;
