const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');
const inMemoryStore = require('../services/inMemoryStore');
const { checkSeatConflict, autoUpdateExpiredReservations } = require('../services/reservationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Create a new seat reservation
// @route   POST /api/reservations
// @access  Private (Student & Admin)
const createReservation = async (req, res, next) => {
  try {
    const { studySpaceId, seatId, startTime, endTime, durationMinutes, purpose, notes } = req.body;

    if (!studySpaceId || !seatId) {
      return res.status(400).json({ success: false, message: 'Please provide studySpaceId and seatId.' });
    }

    if (req.user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked. You cannot create new reservations.',
      });
    }

    if (isDbConnected()) {
      const space = await StudySpace.findById(studySpaceId);
      if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });
      if (space.status !== 'open') return res.status(400).json({ success: false, message: `Space is ${space.status}` });

      const seat = await Seat.findById(seatId);
      if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
      if (seat.status === 'blocked') return res.status(400).json({ success: false, message: 'Seat is under maintenance' });

      const start = startTime ? new Date(startTime) : new Date();
      const duration = Number(durationMinutes) || 120;
      const end = endTime ? new Date(endTime) : new Date(start.getTime() + duration * 60 * 1000);

      const conflict = await checkSeatConflict(seat._id, start, end);
      if (conflict) {
        return res.status(400).json({ success: false, message: `Seat ${seat.seatId} is already reserved for this time window.` });
      }

      const reservation = await Reservation.create({
        user: req.user._id,
        studySpace: space._id,
        seat: seat._id,
        seatId: seat.seatId,
        startTime: start,
        endTime: end,
        durationMinutes: duration,
        status: 'active',
        purpose: purpose || 'Study Session',
        notes: notes || '',
      });

      const populatedRes = await Reservation.findById(reservation._id)
        .populate('studySpace')
        .populate('seat')
        .populate('user', 'name email studentId');

      return res.status(201).json({ success: true, data: populatedRes });
    }

    // In-Memory Mode
    const space = inMemoryStore.spaces.find((s) => s._id === studySpaceId);
    if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });

    const seat = inMemoryStore.seats.find((s) => s._id === seatId || (s.spaceId === space._id && s.seatId === seatId));
    if (!seat) return res.status(404).json({ success: false, message: 'Seat not found' });
    if (seat.status === 'blocked') return res.status(400).json({ success: false, message: 'Seat is disabled / maintenance' });

    const start = startTime ? new Date(startTime) : new Date();
    const duration = Number(durationMinutes) || 120;
    const end = endTime ? new Date(endTime) : new Date(start.getTime() + duration * 60 * 1000);

    // Conflict check
    const existingConflict = inMemoryStore.reservations.find(
      (r) =>
        r.studySpace._id === space._id &&
        r.seatId === seat.seatId &&
        r.status === 'active' &&
        new Date(r.startTime) < end &&
        new Date(r.endTime) > start
    );

    if (existingConflict) {
      return res.status(400).json({ success: false, message: `Seat ${seat.seatId} is already reserved for this time window.` });
    }

    const newRes = {
      _id: `res_${Date.now()}`,
      user: req.user,
      studySpace: space,
      seat,
      seatId: seat.seatId,
      startTime: start,
      endTime: end,
      durationMinutes: duration,
      status: 'active',
      purpose: purpose || 'Study Session',
      notes: notes || '',
      createdAt: new Date(),
    };

    inMemoryStore.reservations.unshift(newRes);

    res.status(201).json({
      success: true,
      message: `Reservation confirmed for Seat ${seat.seatId} in ${space.name}!`,
      data: newRes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's reservations
// @route   GET /api/reservations
// @access  Private (Student)
const getMyReservations = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      await autoUpdateExpiredReservations();
      const { status } = req.query;
      const query = { user: req.user._id };
      if (status && status !== 'all') query.status = status;
      const reservations = await Reservation.find(query)
        .populate('studySpace')
        .populate('seat')
        .sort({ startTime: -1 });
      return res.json({ success: true, count: reservations.length, data: reservations });
    }

    // In-Memory Mode
    const userRes = inMemoryStore.reservations.filter(
      (r) => (r.user?._id === req.user._id || r.user === req.user._id)
    );

    const { status } = req.query;
    let filtered = userRes;
    if (status && status !== 'all') {
      filtered = userRes.filter((r) => r.status === status);
    }

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const resv = await Reservation.findById(req.params.id).populate('studySpace').populate('seat').populate('user');
      if (!resv) return res.status(404).json({ success: false, message: 'Reservation not found' });
      return res.json({ success: true, data: resv });
    }

    const resv = inMemoryStore.reservations.find((r) => r._id === req.params.id);
    if (!resv) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: resv });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelReservation = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
      reservation.status = 'cancelled';
      await reservation.save();
      return res.json({ success: true, message: 'Reservation cancelled successfully', data: reservation });
    }

    const index = inMemoryStore.reservations.findIndex((r) => r._id === req.params.id);
    if (index === -1) return res.status(404).json({ success: false, message: 'Reservation not found' });

    inMemoryStore.reservations[index].status = 'cancelled';
    res.json({ success: true, message: 'Reservation cancelled successfully', data: inMemoryStore.reservations[index] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations across campus (Admin)
// @route   GET /api/admin/reservations
// @access  Private (Admin)
const getAllReservations = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const { status, spaceId, search } = req.query;
      const query = {};
      if (status && status !== 'all') query.status = status;
      if (spaceId && spaceId !== 'all') query.studySpace = spaceId;

      let reservations = await Reservation.find(query)
        .populate('user', 'name email studentId')
        .populate('studySpace', 'name building floor room')
        .populate('seat', 'seatId label')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: reservations.length, data: reservations });
    }

    // In-Memory Mode
    let result = [...inMemoryStore.reservations];
    const { status, spaceId, search } = req.query;

    if (status && status !== 'all') {
      result = result.filter((r) => r.status === status);
    }
    if (spaceId && spaceId !== 'all') {
      result = result.filter((r) => r.studySpace._id === spaceId || r.studySpace === spaceId);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.user?.name?.toLowerCase().includes(s) ||
          r.user?.email?.toLowerCase().includes(s) ||
          r.studySpace?.name?.toLowerCase().includes(s) ||
          r.seatId?.toLowerCase().includes(s)
      );
    }

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation,
  getAllReservations,
};
