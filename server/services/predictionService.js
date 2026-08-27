const OccupancyHistory = require('../models/OccupancyHistory');
const Reservation = require('../models/Reservation');
const Seat = require('../models/Seat');
const StudySpace = require('../models/StudySpace');

/**
 * Statistical Availability Prediction Service
 * 
 * Algorithm:
 * 1. Takes spaceId, target dayOfWeek (0-6), and target hourOfDay (0-23).
 * 2. Aggregates historical OccupancyHistory snapshots and past Reservation durations.
 * 3. Computes sample count and average historical occupancy percentage.
 * 4. Derives predicted occupancy %, predicted available seats, and confidence level.
 * 5. Handles cold-start / sparse data gracefully with an honest fallback status.
 */
const getSpacePrediction = async (spaceId, targetDate = new Date()) => {
  const space = await StudySpace.findById(spaceId);
  if (!space) {
    throw new Error('Study space not found');
  }

  const dateObj = new Date(targetDate);
  const dayOfWeek = dateObj.getDay();
  const hourOfDay = dateObj.getHours();

  // Get total seats for this space
  const totalSeats = await Seat.countDocuments({ spaceId, status: { $ne: 'blocked' } }) || space.capacity;

  // Query historical occupancy data for this dayOfWeek and hourOfDay (and adjacent +/- 1 hour for smoothing)
  const historyRecords = await OccupancyHistory.find({
    studySpace: spaceId,
    dayOfWeek,
    hourOfDay: { $in: [Math.max(0, hourOfDay - 1), hourOfDay, Math.min(23, hourOfDay + 1)] },
  });

  // Query past reservations at this day of week & hour
  const reservations = await Reservation.find({
    studySpace: spaceId,
    status: { $in: ['active', 'completed'] },
  }).limit(100);

  let reservationMatches = 0;
  reservations.forEach((res) => {
    const resDate = new Date(res.startTime);
    if (resDate.getDay() === dayOfWeek && Math.abs(resDate.getHours() - hourOfDay) <= 1) {
      reservationMatches++;
    }
  });

  const totalSamples = historyRecords.length + reservationMatches;

  if (totalSamples === 0) {
    // Insufficient historical data fallback
    return {
      spaceId: space._id,
      spaceName: space.name,
      dayOfWeek,
      dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
      hourOfDay,
      timeFormatted: `${hourOfDay % 12 || 12}:00 ${hourOfDay >= 12 ? 'PM' : 'AM'}`,
      predictedOccupancy: null,
      predictedAvailableSeats: null,
      confidence: 'insufficient_data',
      message: 'Not enough historical data yet for this time slot. Live availability will be used.',
      hasEnoughData: false,
    };
  }

  // Calculate weighted average occupancy percentage
  let sumOccupancy = 0;
  if (historyRecords.length > 0) {
    historyRecords.forEach((h) => {
      // Direct hour match has higher weight (1.0) than adjacent hours (0.6)
      const weight = h.hourOfDay === hourOfDay ? 1.0 : 0.6;
      sumOccupancy += h.occupancyPercentage * weight;
    });
  }

  const effectiveHistoryWeight = historyRecords.reduce(
    (acc, h) => acc + (h.hourOfDay === hourOfDay ? 1.0 : 0.6),
    0
  );

  let historicalAvg = effectiveHistoryWeight > 0 ? sumOccupancy / effectiveHistoryWeight : 50;

  // Factor in recent reservation density
  if (reservationMatches > 0 && totalSeats > 0) {
    const reservationDerivedOccupancy = Math.min(95, (reservationMatches / Math.max(1, totalSeats)) * 100);
    historicalAvg = (historicalAvg * 0.7) + (reservationDerivedOccupancy * 0.3);
  }

  // Round values
  const predictedOccupancy = Math.min(98, Math.max(5, Math.round(historicalAvg)));
  const predictedOccupiedSeats = Math.round((predictedOccupancy / 100) * totalSeats);
  const predictedAvailableSeats = Math.max(0, totalSeats - predictedOccupiedSeats);

  let confidence = 'low';
  if (totalSamples >= 12) {
    confidence = 'high';
  } else if (totalSamples >= 4) {
    confidence = 'medium';
  }

  // Availability outlook label
  let outlook = 'Moderate';
  if (predictedOccupancy < 40) outlook = 'High Availability';
  else if (predictedOccupancy > 75) outlook = 'Crowded / Low Availability';

  return {
    spaceId: space._id,
    spaceName: space.name,
    dayOfWeek,
    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
    hourOfDay,
    timeFormatted: `${hourOfDay % 12 || 12}:00 ${hourOfDay >= 12 ? 'PM' : 'AM'}`,
    historicalAvgOccupancy: Math.round(historicalAvg),
    predictedOccupancy,
    totalSeats,
    predictedOccupiedSeats,
    predictedAvailableSeats,
    confidence,
    outlook,
    sampleCount: totalSamples,
    hasEnoughData: true,
    message: `Predicted ${predictedOccupancy}% occupancy (${predictedAvailableSeats} seats likely open).`,
  };
};

module.exports = { getSpacePrediction };
