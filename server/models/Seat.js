const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    spaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySpace',
      required: true,
      index: true,
    },
    seatId: {
      type: String,
      required: true,
      trim: true,
    },
    row: {
      type: String,
      required: true,
      trim: true,
    },
    column: {
      type: Number,
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['standard', 'quiet_pod', 'standing_desk', 'group_table', 'booth', 'power_station'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'reserved', 'occupied', 'blocked'],
      default: 'available',
    },
    hasPower: {
      type: Boolean,
      default: true,
    },
    isWindowSeat: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index so each seatId is unique per space
seatSchema.index({ spaceId: 1, seatId: 1 }, { unique: true });
seatSchema.index({ spaceId: 1, row: 1, column: 1 });

const Seat = mongoose.model('Seat', seatSchema);
module.exports = Seat;
