const mongoose = require('mongoose');

const studySpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Space name is required'],
      trim: true,
    },
    building: {
      type: String,
      required: [true, 'Building is required'],
      trim: true,
    },
    floor: {
      type: String,
      required: [true, 'Floor is required'],
      trim: true,
    },
    room: {
      type: String,
      required: [true, 'Room number is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    capacity: {
      type: Number,
      required: [true, 'Total capacity is required'],
      min: 1,
    },
    noiseLevel: {
      type: String,
      enum: ['silent', 'quiet', 'moderate', 'noisy'],
      default: 'quiet',
    },
    wifiAvailable: {
      type: Boolean,
      default: true,
    },
    amenities: {
      type: [String],
      default: ['Wi-Fi', 'Power Outlets'],
    },
    openingHours: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '22:00' },
      days: { type: String, default: 'Mon - Sun' },
      is24Hours: { type: Boolean, default: false },
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'maintenance', 'temporarily_unavailable'],
      default: 'open',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    seatingGrid: {
      rows: { type: Number, default: 5 },
      cols: { type: Number, default: 8 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for searching & filtering
studySpaceSchema.index({ building: 1, noiseLevel: 1, status: 1 });
studySpaceSchema.index({ name: 'text', building: 'text', description: 'text' });

const StudySpace = mongoose.model('StudySpace', studySpaceSchema);
module.exports = StudySpace;
