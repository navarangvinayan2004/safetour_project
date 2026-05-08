require("dotenv").config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const Authority = require('./models/authority');
const Admin = require('./models/admin');
const path = require('path');
const JWT_SECRET = 'safetour_secret';

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Post = require('./models/community');
const SOS = require('./models/sos');
const DangerZone = require('./models/dangerzone');
const Alert = require('./models/alert');
const alertRoutes = require('./routes/alertroutes');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postroutes');

require('dotenv').config();

const infoRoutes = require('./routes/infoRoutes');
const uploadRoutes = require('./routes/upload');
const AUTHORITY_CODE = process.env.AUTHORITY_CODE || 'SAFEAUTH2024';
const ADMIN_CODE = process.env.ADMIN_CODE || 'SAFEADMIN2024';

const app = express();
app.use('/api/upload', uploadRoutes);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/alerts', alertRoutes);
app.use('/api/users', userRoutes);
app.use('/api/info', infoRoutes);
app.use('/api/posts', postRoutes);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user = await User.findById(decoded.id);
    if (!user) {
      user = await Authority.findById(decoded.id);
    }
    if (!user) {
      user = await Admin.findById(decoded.id);
    }
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.post('/api/verify-authority-code', (req, res) => {
  const { code } = req.body;
  res.json({ valid: code === AUTHORITY_CODE });
});

app.post('/api/verify-admin-code', (req, res) => {
  const { code } = req.body;
  res.json({ valid: code === ADMIN_CODE });
});

app.get('/', (req, res) => {
  res.send('SafeTour Backend Running');
});

app.post('/api/signup', async (req, res) => {
  try {
    const {
      name,
      age,
      email,
      password,
      role,
      phoneNumber,
      emergencyPhone,
      medicalInfo,
      code,
    } = req.body;

    const [existingUser, existingAuthority, existingAdmin] = await Promise.all([
      User.exists({ email }),
      Authority.exists({ email }),
      Admin.exists({ email }),
    ]);

    if (existingUser || existingAuthority || existingAdmin) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    if (role === 'authority') {
      if (code !== AUTHORITY_CODE) {
        return res.status(400).json({ error: 'Invalid authority code' });
      }
    }

    if (role === 'admin') {
      if (code !== ADMIN_CODE) {
        return res.status(400).json({ error: 'Invalid admin code' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role === 'authority') {
      user = new Authority({
        name,
        age,
        email,
        password: hashedPassword,
        approvalStatus: 'pending',
        phoneNumber,
      });
    } else if (role === 'admin') {
      user = new Admin({
        name,
        age,
        email,
        password: hashedPassword,
        phoneNumber,
      });
    } else {
      user = new User({
        name,
        age,
        email,
        password: hashedPassword,
        role,
        approvalStatus: 'pending',
        phoneNumber,
        emergencyPhone,
        medicalInfo,
      });
    }

    await user.save();
    res.status(201).json({
      message:
        role === 'admin'
          ? 'Admin account created'
          : 'Account created and waiting for admin approval',
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password, latitude, longitude } = req.body;

    let user = await User.findOne({ email });
    let role = 'tourist';

    if (!user) {
      user = await Authority.findOne({ email });
      role = 'authority';
    }

    if (!user) {
      user = await Admin.findOne({ email });
      role = 'admin';
    }

    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    if ((role === 'tourist' || role === 'authority') && user.approvalStatus !== 'approved') {
      const statusMessage =
        user.approvalStatus === 'rejected'
          ? `Your account was rejected by the admin${
              user.rejectionReason ? `: ${user.rejectionReason}` : ''
            }`
          : 'Your account is pending admin approval';
      return res.status(403).json({ error: statusMessage });
    }

    let approvalAlertMessage = '';

    if (
      (role === 'tourist' || role === 'authority') &&
      user.approvalStatus === 'approved' &&
      user.hasUnreadApprovalDecision
    ) {
      approvalAlertMessage = 'Your account has been approved by the admin.';
      user.hasUnreadApprovalDecision = false;
    }

    if (latitude !== undefined && longitude !== undefined) {
      user.latitude = latitude;
      user.longitude = longitude;
    }

    if (approvalAlertMessage || latitude !== undefined || longitude !== undefined) {
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role }, JWT_SECRET);

    res.json({
      token,
      id: user._id.toString(),
      role,
      name: user.name,
      age: user.age,
      email: user.email,
      approvalStatus: user.approvalStatus,
      phoneNumber: user.phoneNumber,
      emergencyPhone: user.emergencyPhone,
      medicalInfo: user.medicalInfo,
      approvalAlertMessage,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/sos', async (req, res) => {
  try {
    const sos = new SOS(req.body);
    await sos.save();

    // Create an alert for authorities to see
    let message = `${sos.name} (Age: ${sos.age}) sent an SOS alert.\n`;
    message += `Emergency Type: ${sos.emergencyType}\n`;
    message += `Location: ${sos.latitude}, ${sos.longitude}\n`;
    if (sos.role) message += `Role: ${sos.role}\n`;
    if (sos.email) message += `Email: ${sos.email}\n`;
    if (sos.phoneNumber) message += `Phone: ${sos.phoneNumber}\n`;
    if (sos.emergencyPhone) message += `Emergency Contact: ${sos.emergencyPhone}\n`;
    if (sos.medicalInfo) message += `Medical Info: ${sos.medicalInfo}\n`;

    const alert = new Alert({
      title: `SOS Alert: ${sos.emergencyType}`,
      message: message,
      latitude: sos.latitude,
      longitude: sos.longitude,
      radiusKm: 20, // 20km radius
      targetAudience: 'authorities',
      createdBy: 'SOS System',
    });
    await alert.save();

    res.status(201).json({ message: 'SOS saved and alert broadcasted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save SOS' });
  }
});

app.get('/api/sos', authenticateToken, async (req, res) => {
  try {
    const { getDistanceKm } = require('./utils/distance');
    const userLat = req.user.latitude;
    const userLng = req.user.longitude;

    if (!userLat || !userLng) {
      return res.status(400).json({ error: 'User location not available' });
    }

    const allSOS = await SOS.find().sort({ createdAt: -1 });
    
    // Filter SOS within 20km of user's location
    const nearbySOS = allSOS.filter(sos => {
      const distance = getDistanceKm(userLat, userLng, sos.latitude, sos.longitude);
      return distance <= 20;
    });

    res.json(nearbySOS);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SOS' });
  }
});

app.delete('/api/sos/:id', authenticateToken, async (req, res) => {
  try {
    const allowedRoles = ['authority', 'admin'];
    if (!allowedRoles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const sos = await SOS.findById(req.params.id);
    if (!sos) {
      return res.status(404).json({ error: 'SOS not found' });
    }

    await SOS.findByIdAndDelete(req.params.id);
    await Alert.deleteMany({
      latitude: sos.latitude,
      longitude: sos.longitude,
      createdBy: 'SOS System',
    });

    res.json({ message: 'SOS deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete SOS' });
  }
});

app.post('/api/zones', async (req, res) => {
  try {
    const zone = new DangerZone(req.body);
    await zone.save();
    res.status(201).json({ message: 'Zone added' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add zone' });
  }
});

app.delete('/api/zones/:id', async (req, res) => {
  try {
    await DangerZone.findByIdAndDelete(req.params.id);
    res.json({ message: 'Zone deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete zone' });
  }
});

app.get('/api/zones', async (req, res) => {
  const zones = await DangerZone.find();
  res.json(zones);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
