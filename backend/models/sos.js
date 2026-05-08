const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
    name: String,
    age: Number,
    role: String,
    email: String,
    phoneNumber: String,
    emergencyPhone: String,
    medicalInfo: String,
    emergencyType: String,
    latitude: Number,
    longitude: Number,
    createdAt: {
      type: Date,
      default: Date.now,
    },
});

module.exports = mongoose.model('SOS', SOSSchema);