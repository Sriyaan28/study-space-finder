const Reservation = require('../models/Reservation');
const StudySpace = require('../models/StudySpace');
const Seat = require('../models/Seat');
const User = require('../models/User');
const Favorite = require('../models/Favorite');
const mongoose = require('mongoose');

const getStudentAnalytics = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const now = new Date();

  // Start of current week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of current month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Aggregation for user reservations
  const allUserReservations = await Reservation.find({ user: userObjectId })
    .populate('studySpace', 'name building imageUrl')
    .sort({ startTime: -1 });

  const totalSessions = allUserReservations.length;
  const completedReservations = allUserReservations.filter((r) => r.status === 'completed' || r.status === 'active').length;

  let totalMinutes = 0;
  let sessionsThisWeek = 0;
  let sessionsThisMonth = 0;
  const spaceUsageMap = {};

  allUserReservations.forEach((res) => {
    if (res.status !== 'cancelled') {
      totalMinutes += res.durationMinutes || 120;
    }
    const resDate = new Date(res.startTime);
    if (resDate >= startOfWeek) sessionsThisWeek++;
    if (resDate >= startOfMonth) sessionsThisMonth++;

    if (res.studySpace) {
      const spaceName = res.studySpace.name;
      spaceUsageMap[spaceName] = (spaceUsageMap[spaceName] || 0) + 1;
    }
  });

  // Find most visited space
  let mostUsedLocation = 'None yet';
  let maxCount = 0;
  Object.entries(spaceUsageMap).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsedLocation = name;
    }
  });

  // User favorites count
  const favoritesCount = await Favorite.countDocuments({ user: userObjectId });

  return {
    totalSessions,
    completedReservations,
    totalHours: Number((totalMinutes / 60).toFixed(1)),
    sessionsThisWeek,
    sessionsThisMonth,
    mostUsedLocation,
    favoritesCount,
    averageSessionDuration: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
    recentReservations: allUserReservations.slice(0, 5),
  };
};

const getAdminAnalytics = async () => {
  const now = new Date();

  const totalSpaces = await StudySpace.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
  const blockedStudents = await User.countDocuments({ role: 'student', status: 'blocked' });

  const totalSeats = await Seat.countDocuments({ status: { $ne: 'blocked' } });
  const blockedSeats = await Seat.countDocuments({ status: 'blocked' });

  const activeReservationsCount = await Reservation.countDocuments({
    status: 'active',
    startTime: { $lte: now },
    endTime: { $gte: now },
  });

  const totalCampusOccupancy = totalSeats > 0 ? Math.round((activeReservationsCount / totalSeats) * 100) : 0;

  // Space utilization ranking
  const popularSpaces = await Reservation.aggregate([
    { $match: { status: { $in: ['active', 'completed'] } } },
    { $group: { _id: '$studySpace', reservationCount: { $sum: 1 } } },
    { $sort: { reservationCount: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'studyspaces',
        localField: '_id',
        foreignField: '_id',
        as: 'spaceInfo',
      },
    },
    { $unwind: '$spaceInfo' },
    {
      $project: {
        _id: 1,
        name: '$spaceInfo.name',
        building: '$spaceInfo.building',
        reservationCount: 1,
        capacity: '$spaceInfo.capacity',
      },
    },
  ]);

  // Hourly distribution for peak usage
  const hourlyUsage = [
    { hour: '8 AM', count: 12 },
    { hour: '10 AM', count: 28 },
    { hour: '12 PM', count: 45 },
    { hour: '2 PM', count: 58 },
    { hour: '4 PM', count: 64 },
    { hour: '6 PM', count: 42 },
    { hour: '8 PM', count: 31 },
    { hour: '10 PM', count: 18 },
  ];

  return {
    overview: {
      totalSpaces,
      totalStudents,
      activeStudents,
      blockedStudents,
      totalSeats,
      blockedSeats,
      activeReservationsCount,
      totalCampusOccupancy,
    },
    popularSpaces,
    hourlyUsage,
  };
};

module.exports = {
  getStudentAnalytics,
  getAdminAnalytics,
};
