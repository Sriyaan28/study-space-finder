const mongoose = require('mongoose');

const occupancyHistorySchema = new mongoose.Schema(
  {
    studySpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySpace',
      required: true,
      index: true,
    },
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6, // 0 = Sun, 1 = Mon, ..., 6 = Sat
      index: true,
    },
    hourOfDay: {
      type: Number,
      required: true,
      min: 0,
      max: 23,
      index: true,
    },
    occupancyPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    occupiedSeats: {
      type: Number,
      default: 0,
    },
    totalSeats: {
      type: Number,
      default: 0,
    },
    sampleDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

occupancyHistorySchema.index({ studySpace: 1, dayOfWeek: 1, hourOfDay: 1 });

const OccupancyHistory = mongoose.model('OccupancyHistory', occupancyHistorySchema);
module.exports = OccupancyHistory;
