const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

favoriteSchema.index({ user: 1, studySpace: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
