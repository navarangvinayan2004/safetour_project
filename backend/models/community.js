const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: String,
  userId: String,
  message: String,
  media: String,
  latitude: Number,
  longitude: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', PostSchema);
