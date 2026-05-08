const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: String,
    message: String,

    latitude: Number,
    longitude: Number,

    radiusKm: {
      type: Number,
      default: 20, // 20 km
    },

    targetAudience: {
      type: String,
      enum: ['all', 'tourists', 'authorities'],
      default: 'all',
    },

    createdBy: {
      type: String, // authority name or 'SOS System'
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
