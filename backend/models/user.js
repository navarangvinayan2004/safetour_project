const mongoose = require('mongoose');

const AdminNoteSchema = new mongoose.Schema(
  {
    text: String,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ApprovalHistorySchema = new mongoose.Schema(
  {
    status: String,
    reason: String,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  name: String,
  age: Number,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    default: 'tourist',
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  phoneNumber: String,
  emergencyPhone: String,
  medicalInfo: String,
  latitude: Number,
  longitude: Number,
  approvalUpdatedAt: Date,
  approvalReviewedBy: String,
  rejectionReason: String,
  hasUnreadApprovalDecision: {
    type: Boolean,
    default: false,
  },
  approvalDecisionAt: Date,
  adminNotes: {
    type: [AdminNoteSchema],
    default: [],
  },
  approvalHistory: {
    type: [ApprovalHistorySchema],
    default: [],
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
