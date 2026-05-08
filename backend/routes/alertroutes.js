const express = require('express');
const router = express.Router();
const Alert = require('../models/alert');
const { getDistanceKm } = require('../utils/distance');
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'safetour_secret';
const User = require('../models/user');
const Authority = require('../models/authority');
const Admin = require('../models/admin');

// Middleware to get user role if authenticated
const getUserRole = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      let user = await User.findById(decoded.id);
      if (!user) {
        user = await Authority.findById(decoded.id);
      }
      if (!user) {
        user = await Admin.findById(decoded.id);
      }
      if (user) {
        req.userRole = decoded.role;
      }
    } catch (err) {
      // Invalid token, treat as unauthenticated
    }
  }
  // If no token or invalid, default to tourist
  if (!req.userRole) {
    req.userRole = 'tourist';
  }
  next();
};

router.get('/', getUserRole, async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Location required' });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const alerts = await Alert.find();

    const nearbyAlerts = alerts.filter(alert => {
      if (alert.latitude == null || alert.longitude == null) {
        return false;
      }

      // Check target audience
      if (alert.targetAudience === 'authorities' && req.userRole !== 'authority' && req.userRole !== 'admin') {
        return false;
      }
      if (alert.targetAudience === 'tourists' && req.userRole !== 'tourist') {
        return false;
      }
      // 'all' is visible to everyone

      const distance = getDistanceKm(
        userLat,
        userLon,
        alert.latitude,
        alert.longitude
      );

      return distance <= (alert.radiusKm || 20);
    });

    res.json(nearbyAlerts);
  } catch (err) {
    console.error('Alert fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

router.post('/', async (req, res) => {
  try {
    const alert = new Alert(req.body);
    await alert.save();

    res.status(201).json({ message: 'Alert broadcasted successfully' });
  } catch (err) {
    console.error('Alert create error:', err);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

module.exports = router;
