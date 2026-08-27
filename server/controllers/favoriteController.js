const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');
const StudySpace = require('../models/StudySpace');
const inMemoryStore = require('../services/inMemoryStore');
const { enrichSpacesWithLiveAvailability } = require('../services/reservationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get current user favorites
// @route   GET /api/favorites
// @access  Private (Student)
const getMyFavorites = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const favorites = await Favorite.find({ user: req.user._id }).populate('studySpace');
      const validSpaces = favorites.map((f) => f.studySpace).filter(Boolean);
      const enrichedSpaces = await enrichSpacesWithLiveAvailability(validSpaces);
      return res.json({ success: true, count: enrichedSpaces.length, data: enrichedSpaces.map((s) => ({ ...s, isFavorite: true })) });
    }

    // In-Memory Mode
    const userFavs = inMemoryStore.favorites.filter((f) => f.user === req.user._id);
    const spaces = userFavs.map((f) => {
      const spaceObj = typeof f.studySpace === 'object' ? f.studySpace : inMemoryStore.spaces.find((s) => s._id === f.studySpace);
      return spaceObj;
    }).filter(Boolean);

    const now = new Date();
    const enriched = spaces.map((sp) => {
      const spSeats = inMemoryStore.seats.filter((st) => st.spaceId === sp._id && st.status !== 'blocked');
      const activeRes = inMemoryStore.reservations.filter(
        (r) => (r.studySpace._id === sp._id || r.studySpace === sp._id) && r.status === 'active' && new Date(r.startTime) <= now && new Date(r.endTime) >= now
      );
      const total = spSeats.length || sp.capacity;
      const occupied = activeRes.length;
      const available = Math.max(0, total - occupied);
      const pct = Math.round((occupied / Math.max(1, total)) * 100);

      return {
        ...sp,
        isFavorite: true,
        liveStats: {
          totalSeats: total,
          occupiedSeats: occupied,
          availableSeats: available,
          occupancyPercentage: pct,
          isAvailableNow: available > 0 && sp.status === 'open',
        },
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Add space to favorites
// @route   POST /api/favorites/:spaceId
// @access  Private (Student)
const addFavorite = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const space = await StudySpace.findById(req.params.spaceId);
      if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });
      await Favorite.findOneAndUpdate(
        { user: req.user._id, studySpace: req.params.spaceId },
        { user: req.user._id, studySpace: req.params.spaceId },
        { upsert: true }
      );
      return res.status(201).json({ success: true, message: 'Added to favorites', spaceId: req.params.spaceId });
    }

    const space = inMemoryStore.spaces.find((s) => s._id === req.params.spaceId);
    if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });

    const exists = inMemoryStore.favorites.some((f) => f.user === req.user._id && (f.studySpace._id === space._id || f.studySpace === space._id));
    if (!exists) {
      inMemoryStore.favorites.push({
        _id: `fav_${Date.now()}`,
        user: req.user._id,
        studySpace: space,
      });
    }

    res.status(201).json({ success: true, message: 'Added to favorites', spaceId: req.params.spaceId });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove space from favorites
// @route   DELETE /api/favorites/:spaceId
// @access  Private (Student)
const removeFavorite = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      await Favorite.findOneAndDelete({ user: req.user._id, studySpace: req.params.spaceId });
      return res.json({ success: true, message: 'Removed from favorites', spaceId: req.params.spaceId });
    }

    inMemoryStore.favorites = inMemoryStore.favorites.filter(
      (f) => !(f.user === req.user._id && (f.studySpace._id === req.params.spaceId || f.studySpace === req.params.spaceId))
    );

    res.json({ success: true, message: 'Removed from favorites', spaceId: req.params.spaceId });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFavorites,
  addFavorite,
  removeFavorite,
};
