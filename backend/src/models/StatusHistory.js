const mongoose = require('mongoose');
const { COMPLAINT_STATUSES } = require('./Complaint');

const statusHistorySchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      required: [true, 'Complaint ID reference is required'],
      index: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: COMPLAINT_STATUSES,
    },
    note: {
      type: String,
      trim: true,
      default: '',
    },
    evidencePhotoUrl: {
      type: String,
      default: null,
    },
    changedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
      name: {
        type: String,
        default: 'System',
      },
      role: {
        type: String,
        default: 'admin',
      },
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

statusHistorySchema.index({ complaintId: 1, changedAt: 1 });

const StatusHistory = mongoose.model('StatusHistory', statusHistorySchema);

module.exports = StatusHistory;
