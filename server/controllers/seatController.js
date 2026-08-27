const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');
const inMemoryStore = require('../services/inMemoryStore');
const { getSpaceSeatingStatus } = require('../services/reservationService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get dynamic seating layout and real-time status for a space
// @route   GET /api/spaces/:id/seats
// @access  Public
const getSpaceSeats = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.query;

    if (isDbConnected()) {
      const data = await getSpaceSeatingStatus(req.params.id, startTime, endTime);
      return res.json({ success: true, data });
    }

    // In-Memory Mode
    const space = inMemoryStore.spaces.find((s) => s._id === req.params.id);
    if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });

    const spaceSeats = inMemoryStore.seats.filter((s) => s.spaceId === space._id);
    const now = new Date();
    const activeRes = inMemoryStore.reservations.filter(
      (r) => (r.studySpace._id === space._id || r.studySpace === space._id) && r.status === 'active'
    );

    const resMap = new Map();
    activeRes.forEach((r) => {
      resMap.set(r.seatId, r);
    });

    let availableCount = 0;
    let occupiedCount = 0;
    let reservedCount = 0;
    let blockedCount = 0;

    const dynamicSeats = spaceSeats.map((seat) => {
      const reservation = resMap.get(seat.seatId);
      let currentStatus = seat.status;

      if (seat.status === 'blocked') {
        currentStatus = 'blocked';
        blockedCount++;
      } else if (reservation) {
        if (new Date(reservation.startTime) <= now && new Date(reservation.endTime) >= now) {
          currentStatus = 'occupied';
          occupiedCount++;
        } else {
          currentStatus = 'reserved';
          reservedCount++;
        }
      } else {
        currentStatus = 'available';
        availableCount++;
      }

      return {
        ...seat,
        currentStatus,
        activeReservation: reservation ? {
          id: reservation._id,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          userName: reservation.user?.name || 'Reserved Student',
        } : null,
      };
    });

    const totalSeats = spaceSeats.length || space.capacity;
    const occupancyPercentage = totalSeats > 0 ? Math.round(((occupiedCount + reservedCount) / totalSeats) * 100) : 0;

    res.json({
      success: true,
      data: {
        space,
        seats: dynamicSeats,
        summary: {
          totalSeats,
          availableSeats: availableCount,
          occupiedSeats: occupiedCount,
          reservedSeats: reservedCount,
          blockedSeats: blockedCount,
          occupancyPercentage,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Batch save or configure seating layout for a space (Admin)
// @route   POST /api/spaces/:id/layout
// @access  Private (Admin)
const saveSpaceLayout = async (req, res, next) => {
  try {
    const spaceId = req.params.id;
    const { rows, cols, seats } = req.body;

    if (isDbConnected()) {
      const space = await StudySpace.findById(spaceId);
      if (!space) return res.status(404).json({ success: false, message: 'Study space not found' });

      if (seats && Array.isArray(seats) && seats.length > 0) {
        await Seat.deleteMany({ spaceId });
        const seatsToInsert = seats.map((s) => ({
          spaceId,
          seatId: s.seatId,
          row: s.row || s.seatId.charAt(0),
          column: Number(s.column) || 1,
          label: s.label || `Seat ${s.seatId}`,
          type: s.type || 'standard',
          status: s.status || 'available',
          hasPower: s.hasPower !== undefined ? s.hasPower : true,
          isWindowSeat: !!s.isWindowSeat,
        }));
        await Seat.insertMany(seatsToInsert);
        space.capacity = seatsToInsert.length;
        if (rows && cols) space.seatingGrid = { rows: Number(rows), cols: Number(cols) };
        await space.save();
      }

      const updatedData = await getSpaceSeatingStatus(spaceId);
      return res.json({ success: true, data: updatedData });
    }

    // In-Memory Mode
    const spaceIndex = inMemoryStore.spaces.findIndex((s) => s._id === spaceId);
    if (spaceIndex === -1) return res.status(404).json({ success: false, message: 'Study space not found' });

    if (seats && Array.isArray(seats)) {
      inMemoryStore.seats = inMemoryStore.seats.filter((s) => s.spaceId !== spaceId);
      seats.forEach((s) => {
        inMemoryStore.seats.push({
          _id: s._id || `seat_${spaceId}_${s.seatId}`,
          spaceId,
          seatId: s.seatId,
          row: s.row || s.seatId.charAt(0),
          column: Number(s.column) || 1,
          label: s.label || `Seat ${s.seatId}`,
          type: s.type || 'standard',
          status: s.status || 'available',
          hasPower: s.hasPower !== undefined ? s.hasPower : true,
          isWindowSeat: !!s.isWindowSeat,
        });
      });
      inMemoryStore.spaces[spaceIndex].capacity = seats.length;
      if (rows && cols) inMemoryStore.spaces[spaceIndex].seatingGrid = { rows: Number(rows), cols: Number(cols) };
    }

    return getSpaceSeats(req, res, next);
  } catch (error) {
    next(error);
  }
};

const createSeat = async (req, res, next) => {
  res.json({ success: true });
};
const updateSeat = async (req, res, next) => {
  res.json({ success: true });
};
const deleteSeat = async (req, res, next) => {
  res.json({ success: true });
};

module.exports = {
  getSpaceSeats,
  createSeat,
  updateSeat,
  saveSpaceLayout,
  deleteSeat,
};
