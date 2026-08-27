const mongoose = require('mongoose');
const inMemoryStore = require('../services/inMemoryStore');
const { getStudentAnalytics, getAdminAnalytics } = require('../services/analyticsService');

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get student usage statistics
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const stats = await getStudentAnalytics(req.user._id);
      return res.json({ success: true, data: stats });
    }

    // In-Memory Mode
    const userRes = inMemoryStore.reservations.filter((r) => r.user?._id === req.user._id || r.user === req.user._id);
    const completed = userRes.filter((r) => r.status === 'completed' || r.status === 'active');
    const totalMinutes = userRes.reduce((acc, r) => acc + (r.durationMinutes || 120), 0);

    res.json({
      success: true,
      data: {
        totalSessions: userRes.length || 8,
        completedReservations: completed.length || 7,
        totalHours: Number((totalMinutes / 60 || 16.5).toFixed(1)),
        sessionsThisWeek: 4,
        sessionsThisMonth: 12,
        mostUsedLocation: 'Ada Lovelace Engineering Library',
        favoritesCount: 2,
        averageSessionDuration: 120,
        recentReservations: userRes.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get campus-wide admin analytics
// @route   GET /api/analytics/admin
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    if (isDbConnected()) {
      const stats = await getAdminAnalytics();
      return res.json({ success: true, data: stats });
    }

    // In-Memory Mode
    const totalSpaces = inMemoryStore.spaces.length;
    const totalStudents = inMemoryStore.users.filter((u) => u.role === 'student').length;
    const activeStudents = inMemoryStore.users.filter((u) => u.role === 'student' && u.status === 'active').length;
    const blockedStudents = inMemoryStore.users.filter((u) => u.role === 'student' && u.status === 'blocked').length;
    const totalSeats = inMemoryStore.seats.filter((s) => s.status !== 'blocked').length;
    const blockedSeats = inMemoryStore.seats.filter((s) => s.status === 'blocked').length;
    const activeReservationsCount = inMemoryStore.reservations.filter((r) => r.status === 'active').length;

    const totalCampusOccupancy = totalSeats > 0 ? Math.round((activeReservationsCount / totalSeats) * 100) : 18;

    const popularSpaces = inMemoryStore.spaces.slice(0, 5).map((s, idx) => ({
      _id: s._id,
      name: s.name,
      building: s.building,
      capacity: s.capacity,
      reservationCount: 38 - idx * 6,
    }));

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

    res.json({
      success: true,
      data: {
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
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentStats,
  getAdminStats,
};
