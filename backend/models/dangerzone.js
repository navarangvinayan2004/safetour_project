const mongoose = require('mongoose');

const DangerZoneSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  radius: Number,
  severity: String, // low | medium | high
  type: String,     // crime | accident | weather
  description: String, // ✅ ADD THIS
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('DangerZone', DangerZoneSchema);
