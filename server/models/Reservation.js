const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    studySpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySpace',
      required: true,
      index: true,
    },
    seat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Seat',
      required: true,
      index: true,
    },
    seatId: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 120, // 2 hours default
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
      index: true,
    },
    purpose: {
      type: String,
      default: 'Study Session',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reservationSchema.index({ seat: 1, status: 1, startTime: 1, endTime: 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ studySpace: 1, status: 1 });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
