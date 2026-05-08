const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user: String,
    message: String,
    media: String,
    latitude: Number,
    longitude: Number,
}, { timestamps: true });

module.exports = mongoose.models.Post || mongoose.model('Post', postSchema);