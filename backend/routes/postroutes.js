const express = require('express');
const router = express.Router();
const Post = require('../models/community');
const { getDistanceKm } = require('../utils/distance');

router.get('/', async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const posts = await Post.find().sort({ _id: -1 });

    const nearbyPosts = posts.filter(post => {
      if (post.latitude == null || post.longitude == null) return false;

      const distance = getDistanceKm(
        userLat,
        userLon,
        post.latitude,
        post.longitude
      );

      return distance <= 20;
    });

    res.json(nearbyPosts);
  } catch (err) {
    console.error('Post fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

router.post('/', async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save post' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { userId, message, media } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.userId || post.userId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    post.message = message;
    post.media = media || '';
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update post' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { userId } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.userId || post.userId !== userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;
