const mongoose = require('mongoose');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const Favorite = require('../models/Favorite');
const inMemoryStore = require('../services/inMemoryStore');
const { enrichSpacesWithLiveAvailability } = require('../services/reservationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all study spaces with filters & live availability
// @route   GET /api/spaces
// @access  Public
const getSpaces = async (req, res, next) => {
  try {
    const { search, noiseLevel, wifi, building, status, minCapacity, availableNow } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { building: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { room: { $regex: search, $options: 'i' } },
        ];
      }
      if (noiseLevel && noiseLevel !== 'all' && noiseLevel !== 'any') query.noiseLevel = noiseLevel.toLowerCase();
      if (wifi !== undefined && wifi !== '' && wifi !== 'any') query.wifiAvailable = wifi === 'true' || wifi === true;
      if (building && building !== 'all') query.building = { $regex: building, $options: 'i' };
      if (status && status !== 'all') query.status = status;
      if (minCapacity) query.capacity = { $gte: Number(minCapacity) };

      const spaces = await StudySpace.find(query).sort({ featured: -1, createdAt: -1 });
      const enrichedSpaces = await enrichSpacesWithLiveAvailability(spaces);

      let finalSpaces = enrichedSpaces;
      if (availableNow === 'true' || availableNow === true) {
        finalSpaces = enrichedSpaces.filter(
          (s) => s.liveStats && s.liveStats.availableSeats > 0 && s.status === 'open'
        );
      }

      return res.json({ success: true, count: finalSpaces.length, data: finalSpaces });
    }

    // In-Memory Mode
    let filtered = [...inMemoryStore.spaces];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (sp) =>
          sp.name.toLowerCase().includes(s) ||
          sp.building.toLowerCase().includes(s) ||
          sp.description?.toLowerCase().includes(s) ||
          sp.room?.toLowerCase().includes(s) ||
          sp.amenities?.some((a) => a.toLowerCase().includes(s))
      );
    }

    if (noiseLevel && noiseLevel !== 'all' && noiseLevel !== 'any') {
      filtered = filtered.filter((sp) => sp.noiseLevel === noiseLevel.toLowerCase());
    }

    if (wifi === 'true' || wifi === true) {
      filtered = filtered.filter((sp) => sp.wifiAvailable);
    }

    if (building && building !== 'all') {
      filtered = filtered.filter((sp) => sp.building.toLowerCase().includes(building.toLowerCase()));
    }

    if (status && status !== 'all') {
      filtered = filtered.filter((sp) => sp.status === status);
    }

    // Calculate live seats for in-memory
    const now = new Date();
    const enriched = filtered.map((sp) => {
      const spSeats = inMemoryStore.seats.filter((st) => st.spaceId === sp._id && st.status !== 'blocked');
      const activeRes = inMemoryStore.reservations.filter(
        (r) => r.studySpace._id === sp._id && r.status === 'active' && new Date(r.startTime) <= now && new Date(r.endTime) >= now
      );
      const total = spSeats.length || sp.capacity;
      const occupied = activeRes.length;
      const available = Math.max(0, total - occupied);
      const pct = Math.round((occupied / Math.max(1, total)) * 100);

      return {
        ...sp,
        liveStats: {
          totalSeats: total,
          occupiedSeats: occupied,
          availableSeats: available,
          occupancyPercentage: pct,
          isAvailableNow: available > 0 && sp.status === 'open',
        },
      };
    });

    let result = enriched;
    if (availableNow === 'true' || availableNow === true) {
      result = enriched.filter((s) => s.liveStats.availableSeats > 0 && s.status === 'open');
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study space by ID
// @route   GET /api/spaces/:id
// @access  Public
const getSpaceById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const space = await StudySpace.findById(req.params.id);
      if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });
      const [enriched] = await enrichSpacesWithLiveAvailability([space]);
      let isFavorite = false;
      if (req.user) {
        const fav = await Favorite.findOne({ user: req.user._id, studySpace: space._id });
        isFavorite = !!fav;
      }
      return res.json({ success: true, data: { ...enriched, isFavorite } });
    }

    // In-Memory Mode
    const space = inMemoryStore.spaces.find((s) => s._id === req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });

    const now = new Date();
    const spSeats = inMemoryStore.seats.filter((st) => st.spaceId === space._id && st.status !== 'blocked');
    const activeRes = inMemoryStore.reservations.filter(
      (r) => (r.studySpace._id === space._id || r.studySpace === space._id) && r.status === 'active' && new Date(r.startTime) <= now && new Date(r.endTime) >= now
    );
    const total = spSeats.length || space.capacity;
    const occupied = activeRes.length;
    const available = Math.max(0, total - occupied);
    const pct = Math.round((occupied / Math.max(1, total)) * 100);

    let isFavorite = false;
    if (req.user) {
      isFavorite = inMemoryStore.favorites.some((f) => f.user === req.user._id && (f.studySpace._id === space._id || f.studySpace === space._id));
    }

    res.json({
      success: true,
      data: {
        ...space,
        liveStats: {
          totalSeats: total,
          occupiedSeats: occupied,
          availableSeats: available,
          occupancyPercentage: pct,
          isAvailableNow: available > 0 && space.status === 'open',
        },
        isFavorite,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create study space (Admin)
// @route   POST /api/spaces
// @access  Private (Admin)
const createSpace = async (req, res, next) => {
  try {
    const spaceData = {
      name: req.body.name,
      building: req.body.building,
      floor: req.body.floor,
      room: req.body.room,
      description: req.body.description || '',
      capacity: Number(req.body.capacity) || 30,
      noiseLevel: req.body.noiseLevel || 'quiet',
      wifiAvailable: req.body.wifiAvailable !== undefined ? req.body.wifiAvailable : true,
      amenities: req.body.amenities || ['Wi-Fi', 'Power Outlets'],
      openingHours: req.body.openingHours || { open: '08:00', close: '22:00', days: 'Mon - Sun' },
      status: req.body.status || 'open',
      imageUrl: req.body.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
      featured: !!req.body.featured,
      seatingGrid: req.body.seatingGrid || { rows: 4, cols: 6 },
    };

    if (isDbConnected()) {
      const space = await StudySpace.create(spaceData);
      return res.status(201).json({ success: true, data: space });
    }

    const newSpace = {
      _id: `sp_${Date.now()}`,
      ...spaceData,
      createdAt: new Date(),
    };

    inMemoryStore.spaces.push(newSpace);

    // Auto-generate seats
    const rowsCount = newSpace.seatingGrid.rows || 4;
    const colsCount = newSpace.seatingGrid.cols || 6;
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let r = 0; r < rowsCount; r++) {
      const rowLetter = rowLetters[r];
      for (let c = 1; c <= colsCount; c++) {
        inMemoryStore.seats.push({
          _id: `seat_${newSpace._id}_${rowLetter}${c}`,
          spaceId: newSpace._id,
          seatId: `${rowLetter}${c}`,
          row: rowLetter,
          column: c,
          label: `Seat ${rowLetter}${c}`,
          type: 'standard',
          status: 'available',
          hasPower: true,
          isWindowSeat: c === 1 || c === colsCount,
        });
      }
    }

    res.status(201).json({ success: true, data: newSpace });
  } catch (error) {
    next(error);
  }
};

// @desc    Update study space (Admin)
// @route   PUT /api/spaces/:id
// @access  Private (Admin)
const updateSpace = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const space = await StudySpace.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, data: space });
    }

    const index = inMemoryStore.spaces.findIndex((s) => s._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Study space not found' });

    inMemoryStore.spaces[index] = { ...inMemoryStore.spaces[index], ...req.body };
    res.json({ success: true, data: inMemoryStore.spaces[index] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study space (Admin)
// @route   DELETE /api/spaces/:id
// @access  Private (Admin)
const deleteSpace = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      await Seat.deleteMany({ spaceId: req.params.id });
      await StudySpace.findByIdAndDelete(req.params.id);
      return res.json({ success: true, message: 'Deleted' });
    }

    inMemoryStore.spaces = inMemoryStore.spaces.filter((s) => s._id !== req.params.id);
    inMemoryStore.seats = inMemoryStore.seats.filter((s) => s.spaceId !== req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unique building list
// @route   GET /api/spaces/meta/buildings
// @access  Public
const getBuildings = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const buildings = await StudySpace.distinct('building');
      return res.json({ success: true, data: buildings });
    }

    const buildings = Array.from(new Set(inMemoryStore.spaces.map((s) => s.building)));
    res.json({ success: true, data: buildings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deleteSpace,
  getBuildings,
};
