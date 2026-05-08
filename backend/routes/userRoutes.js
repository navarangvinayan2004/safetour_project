const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Authority = require('../models/authority');
const Admin = require('../models/admin');
const jwt = require('jsonwebtoken');
const { getDistanceKm } = require('../utils/distance');

const JWT_SECRET = 'safetour_secret';

const MODELS = {
  tourist: User,
  authority: Authority,
};

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

const normalizeValue = value => String(value || '').trim().toLowerCase();

const getCreatedAt = account =>
  account.createdAt ? new Date(account.createdAt) : new Date(account._id.getTimestamp());

const getPriorityScore = account => {
  let score = account.accountType === 'authority' ? 3 : 2;

  if (account.riskFlags.includes('Duplicate email')) score += 2;
  if (account.riskFlags.includes('Duplicate phone')) score += 2;
  if (account.riskFlags.includes('Missing phone number')) score += 1;
  if (account.pendingDays >= 3) score += 2;
  if (account.pendingDays >= 7) score += 2;

  return score;
};

const decorateAccount = (account, accountType, allAccounts) => {
  const createdAt = getCreatedAt(account);
  const now = Date.now();
  const pendingDays = Math.floor((now - createdAt.getTime()) / (1000 * 60 * 60 * 24));

  const normalizedEmail = normalizeValue(account.email);
  const normalizedPhone = normalizeValue(account.phoneNumber);

  const duplicateEmailCount = normalizedEmail
    ? allAccounts.filter(item => normalizeValue(item.email) === normalizedEmail).length
    : 0;
  const duplicatePhoneCount = normalizedPhone
    ? allAccounts.filter(item => normalizeValue(item.phoneNumber) === normalizedPhone).length
    : 0;

  const riskFlags = [];

  if (!account.phoneNumber) riskFlags.push('Missing phone number');
  if (accountType === 'tourist' && !account.emergencyPhone) riskFlags.push('Missing emergency contact');
  if (account.age != null && (account.age < 18 || account.age > 80)) riskFlags.push('Age needs review');
  if (duplicateEmailCount > 1) riskFlags.push('Duplicate email');
  if (duplicatePhoneCount > 1) riskFlags.push('Duplicate phone');
  if (pendingDays >= 7) riskFlags.push('Pending for over a week');

  const verificationFlags = {
    hasEmail: Boolean(account.email),
    hasPhone: Boolean(account.phoneNumber),
    hasEmergencyContact: Boolean(account.emergencyPhone),
    hasMedicalInfo: Boolean(account.medicalInfo),
  };

  const reviewAccount = {
    ...account,
    accountType,
    createdAt,
    pendingDays,
    duplicateEmailCount,
    duplicatePhoneCount,
    riskFlags,
    verificationFlags,
  };

  return {
    ...reviewAccount,
    priorityScore: getPriorityScore(reviewAccount),
  };
};

const loadAllAccounts = async () => {
  const [tourists, authorities] = await Promise.all([
    User.find().sort({ _id: -1 }).lean(),
    Authority.find().sort({ _id: -1 }).lean(),
  ]);

  const combined = [...tourists, ...authorities];

  return [
    ...tourists.map(account => decorateAccount(account, 'tourist', combined)),
    ...authorities.map(account => decorateAccount(account, 'authority', combined)),
  ];
};

const applyFilters = (accounts, query) => {
  const status = query.status || 'pending';
  const accountType = query.accountType || 'all';
  const search = normalizeValue(query.search);

  let filtered = accounts;

  if (status !== 'all') {
    filtered = filtered.filter(account => account.approvalStatus === status);
  }

  if (accountType !== 'all') {
    filtered = filtered.filter(account => account.accountType === accountType);
  }

  if (search) {
    filtered = filtered.filter(account =>
      normalizeValue(account.name).includes(search) ||
      normalizeValue(account.email).includes(search) ||
      normalizeValue(account.phoneNumber).includes(search)
    );
  }

  return filtered;
};

const applySort = (accounts, sort = 'newest') => {
  const sorted = [...accounts];

  switch (sort) {
    case 'oldest':
      sorted.sort((a, b) => a.createdAt - b.createdAt);
      break;
    case 'priority':
      sorted.sort((a, b) => b.priorityScore - a.priorityScore || a.createdAt - b.createdAt);
      break;
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => b.createdAt - a.createdAt);
      break;
  }

  return sorted;
};

const paginate = (accounts, page = 1, limit = 20) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
  const start = (safePage - 1) * safeLimit;

  return {
    items: accounts.slice(start, start + safeLimit),
    page: safePage,
    limit: safeLimit,
    total: accounts.length,
    hasMore: start + safeLimit < accounts.length,
  };
};

router.get('/stats', async (_req, res) => {
  try {
    const accounts = await loadAllAccounts();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const stats = {
      pendingTourists: accounts.filter(
        account => account.accountType === 'tourist' && account.approvalStatus === 'pending'
      ).length,
      pendingAuthorities: accounts.filter(
        account => account.accountType === 'authority' && account.approvalStatus === 'pending'
      ).length,
      approvedToday: accounts.filter(
        account =>
          account.approvalStatus === 'approved' &&
          account.approvalUpdatedAt &&
          new Date(account.approvalUpdatedAt) >= todayStart
      ).length,
      rejectedToday: accounts.filter(
        account =>
          account.approvalStatus === 'rejected' &&
          account.approvalUpdatedAt &&
          new Date(account.approvalUpdatedAt) >= todayStart
      ).length,
      duplicateFlagged: accounts.filter(
        account =>
          account.riskFlags.includes('Duplicate email') ||
          account.riskFlags.includes('Duplicate phone')
      ).length,
      urgentPending: accounts.filter(
        account => account.approvalStatus === 'pending' && account.priorityScore >= 5
      ).length,
      latestPendingCreatedAt: accounts
        .filter(account => account.approvalStatus === 'pending')
        .reduce((latest, account) => {
          if (!latest || new Date(account.createdAt) > new Date(latest)) {
            return account.createdAt;
          }
          return latest;
        }, null),
      lastUpdatedAt: accounts.reduce((latest, account) => {
        const candidate = account.approvalUpdatedAt || account.createdAt;
        return !latest || new Date(candidate) > new Date(latest) ? candidate : latest;
      }, null),
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load approval stats' });
  }
});

router.get('/approval-history', async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const accounts = await loadAllAccounts();

    const history = accounts
      .flatMap(account =>
        (account.approvalHistory || []).map(entry => ({
          ...entry,
          accountId: String(account._id),
          accountName: account.name,
          accountEmail: account.email,
          accountType: account.accountType,
        }))
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load approval history' });
  }
});

router.get('/review-accounts', async (req, res) => {
  try {
    const accounts = await loadAllAccounts();
    const filtered = applySort(applyFilters(accounts, req.query), req.query.sort);
    res.json(paginate(filtered, req.query.page, req.query.limit));
  } catch (error) {
    res.status(500).json({ error: 'Failed to load review accounts' });
  }
});

router.get('/pending', async (req, res) => {
  try {
    const accounts = await loadAllAccounts();
    const filtered = applySort(
      applyFilters(accounts, { ...req.query, status: 'pending' }),
      req.query.sort
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pending accounts' });
  }
});

router.get('/pending-accounts', async (req, res) => {
  try {
    const accounts = await loadAllAccounts();
    const filtered = applySort(
      applyFilters(accounts, { ...req.query, status: 'pending' }),
      req.query.sort
    );
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load pending accounts' });
  }
});

router.patch('/:id/approval', async (req, res) => {
  try {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status, approvalUpdatedAt: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user approval status' });
  }
});

router.patch('/:accountType/:id/approval', async (req, res) => {
  try {
    const { accountType, id } = req.params;
    const { status, reason = '', adminName = 'Admin', note = '' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    if (status === 'rejected' && !String(reason).trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const Model = MODELS[accountType];

    if (!Model) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const update = {
      $set: {
        approvalStatus: status,
        approvalUpdatedAt: new Date(),
        approvalReviewedBy: adminName,
        rejectionReason: status === 'rejected' ? reason.trim() : '',
        hasUnreadApprovalDecision: true,
        approvalDecisionAt: new Date(),
      },
      $push: {
        approvalHistory: {
          status,
          reason: reason.trim(),
          createdBy: adminName,
          createdAt: new Date(),
        },
      },
    };

    if (String(note).trim()) {
      update.$push.adminNotes = {
        text: note.trim(),
        createdBy: adminName,
        createdAt: new Date(),
      };
    }

    const account = await Model.findByIdAndUpdate(id, update, { new: true });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      ...account.toObject(),
      accountType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account approval status' });
  }
});

router.post('/bulk-approval', async (req, res) => {
  try {
    const { accounts = [], status, reason = '', adminName = 'Admin' } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid approval status' });
    }

    if (!Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ error: 'Select at least one account' });
    }

    if (status === 'rejected' && !String(reason).trim()) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const results = await Promise.all(
      accounts.map(async account => {
        const Model = MODELS[account.accountType];
        if (!Model) return null;

        return Model.findByIdAndUpdate(
          account.id,
          {
            $set: {
              approvalStatus: status,
              approvalUpdatedAt: new Date(),
              approvalReviewedBy: adminName,
              rejectionReason: status === 'rejected' ? reason.trim() : '',
              hasUnreadApprovalDecision: true,
              approvalDecisionAt: new Date(),
            },
            $push: {
              approvalHistory: {
                status,
                reason: reason.trim(),
                createdBy: adminName,
                createdAt: new Date(),
              },
            },
          },
          { new: true }
        );
      })
    );

    res.json({
      updated: results.filter(Boolean).length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update selected accounts' });
  }
});

router.post('/:accountType/:id/note', async (req, res) => {
  try {
    const { accountType, id } = req.params;
    const { note, adminName = 'Admin' } = req.body;
    const Model = MODELS[accountType];

    if (!Model) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    if (!String(note || '').trim()) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const account = await Model.findByIdAndUpdate(
      id,
      {
        $push: {
          adminNotes: {
            text: note.trim(),
            createdBy: adminName,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({
      ...account.toObject(),
      accountType,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save admin note' });
  }
});

router.get('/nearby', async (req, res) => {
  const { latitude, longitude } = req.query;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  const users = await User.find({ role: 'tourist', approvalStatus: 'approved' });

  const nearby = users.filter(u => {
    if (u.latitude == null || u.longitude == null) return false;
    return getDistanceKm(lat, lon, u.latitude, u.longitude) <= 20;
  });

  res.json(nearby);
});

// Update user profile
router.put('/profile/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Ensure user can only update their own profile
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email changes might need verification
    delete updateData.role;
    delete updateData.approvalStatus;
    delete updateData.approvalHistory;
    delete updateData.adminNotes;

    // Try to find and update in User model first (tourists)
    let user = await User.findByIdAndUpdate(id, updateData, { new: true });

    // If not found in User model, try Authority model
    if (!user) {
      user = await Authority.findByIdAndUpdate(id, updateData, { new: true });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
