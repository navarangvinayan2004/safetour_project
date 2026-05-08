const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: 'admin' },
  phoneNumber: String,
});

module.exports = mongoose.model('Admin', AdminSchema);
