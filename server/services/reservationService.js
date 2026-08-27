const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');

/**
 * Clean up expired active reservations (transitions to completed)
 */
const autoUpdateExpiredReservations = async () => {
  const now = new Date();
  await Reservation.updateMany(
    {
      status: 'active',
      endTime: { $lt: now },
    },
    {
      $set: { status: 'completed' },
    }
  );
};

/**
 * Check if a specific seat has a conflicting reservation in [startTime, endTime]
 */
const checkSeatConflict = async (seatId, startTime, endTime, excludeReservationId = null) => {
  const query = {
    seat: seatId,
    status: 'active',
    $or: [
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) },
      },
    ],
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const conflicting = await Reservation.findOne(query);
  return conflicting;
};

/**
 * Get dynamic seating layout and real-time status for a study space
 */
const getSpaceSeatingStatus = async (spaceId, targetStartTime = new Date(), targetEndTime = null) => {
  await autoUpdateExpiredReservations();

  const space = await StudySpace.findById(spaceId);
  if (!space) throw new Error('Study space not found');

  const seats = await Seat.find({ spaceId }).sort({ row: 1, column: 1 });

  const queryStart = new Date(targetStartTime);
  const queryEnd = targetEndTime ? new Date(targetEndTime) : new Date(queryStart.getTime() + 2 * 60 * 60 * 1000);

  // Find all active reservations overlapping this window
  const activeReservations = await Reservation.find({
    studySpace: spaceId,
    status: 'active',
    startTime: { $lt: queryEnd },
    endTime: { $gt: queryStart },
  }).populate('user', 'name email');

  const reservationMap = new Map();
  activeReservations.forEach((res) => {
    reservationMap.set(res.seat.toString(), res);
  });

  let availableCount = 0;
  let occupiedCount = 0;
  let reservedCount = 0;
  let blockedCount = 0;

  const dynamicSeats = seats.map((seat) => {
    const seatObj = seat.toObject();
    const reservation = reservationMap.get(seat._id.toString());

    if (seat.status === 'blocked') {
      seatObj.currentStatus = 'blocked';
      blockedCount++;
    } else if (reservation) {
      const now = new Date();
      // If currently active right now vs future in window
      if (reservation.startTime <= now && reservation.endTime >= now) {
        seatObj.currentStatus = 'occupied';
        occupiedCount++;
      } else {
        seatObj.currentStatus = 'reserved';
        reservedCount++;
      }
      seatObj.activeReservation = {
        id: reservation._id,
        startTime: reservation.startTime,
        endTime: reservation.endTime,
        userName: reservation.user?.name || 'Reserved Student',
      };
    } else {
      seatObj.currentStatus = 'available';
      availableCount++;
    }

    return seatObj;
  });

  const totalEffectiveSeats = seats.length || space.capacity;
  const occupancyPercentage = totalEffectiveSeats > 0
    ? Math.round(((occupiedCount + reservedCount) / totalEffectiveSeats) * 100)
    : 0;

  return {
    space,
    seats: dynamicSeats,
    summary: {
      totalSeats: totalEffectiveSeats,
      availableSeats: availableCount,
      occupiedSeats: occupiedCount,
      reservedSeats: reservedCount,
      blockedSeats: blockedCount,
      occupancyPercentage,
    },
  };
};

/**
 * Calculate dynamic occupancy summary for multiple spaces
 */
const enrichSpacesWithLiveAvailability = async (spaces) => {
  await autoUpdateExpiredReservations();
  const now = new Date();

  const spaceIds = spaces.map((s) => s._id);

  // Group active reservations by space
  const activeReservations = await Reservation.aggregate([
    {
      $match: {
        studySpace: { $in: spaceIds },
        status: 'active',
        startTime: { $lte: now },
        endTime: { $gte: now },
      },
    },
    {
      $group: {
        _id: '$studySpace',
        count: { $sum: 1 },
      },
    },
  ]);

  const activeResMap = new Map();
  activeReservations.forEach((item) => {
    activeResMap.set(item._id.toString(), item.count);
  });

  // Group total usable seats by space
  const seatCounts = await Seat.aggregate([
    {
      $match: {
        spaceId: { $in: spaceIds },
        status: { $ne: 'blocked' },
      },
    },
    {
      $group: {
        _id: '$spaceId',
        total: { $sum: 1 },
      },
    },
  ]);

  const seatCountMap = new Map();
  seatCounts.forEach((item) => {
    seatCountMap.set(item._id.toString(), item.total);
  });

  return spaces.map((space) => {
    const spaceObj = space.toObject ? space.toObject() : { ...space };
    const total = seatCountMap.get(space._id.toString()) || space.capacity || 40;
    const occupied = activeResMap.get(space._id.toString()) || 0;
    const available = Math.max(0, total - occupied);
    const occupancyPercentage = Math.round((occupied / Math.max(1, total)) * 100);

    return {
      ...spaceObj,
      liveStats: {
        totalSeats: total,
        occupiedSeats: occupied,
        availableSeats: available,
        occupancyPercentage,
        isAvailableNow: available > 0 && space.status === 'open',
      },
    };
  });
};

module.exports = {
  autoUpdateExpiredReservations,
  checkSeatConflict,
  getSpaceSeatingStatus,
  enrichSpacesWithLiveAvailability,
};
