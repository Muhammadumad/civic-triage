const express = require('express');
const mongoose = require('mongoose');
const { Complaint } = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const RuleSettings = require('../models/RuleSettings');
const { SensitiveZone } = require('../models/SensitiveZone');
const { auth, requireAdmin } = require('../middleware/auth');
const { uploadEvidence } = require('../middleware/upload');
const { calculatePriority } = require('../services/priority');

const router = express.Router();

// Apply admin protection to all admin routes
router.use(auth(true), requireAdmin);

/**
 * @route   GET /api/admin/complaints
 * @desc    Get filtered, priority-sorted complaint queue
 * @access  Private (Admin)
 */
router.get('/complaints', async (req, res, next) => {
  try {
    const { status, category, priorityBand, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priorityBand) filter.priorityBand = priorityBand;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ priorityScore: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('duplicateOf', 'title category priorityScore')
        .select('-embedding'),
      Complaint.countDocuments(filter),
    ]);

    res.status(200).json({
      complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PATCH /api/admin/complaints/:id/status
 * @desc    Update complaint status, department, and attach resolution proof photo
 * @access  Private (Admin)
 */
router.patch('/complaints/:id/status', uploadEvidence, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note, department } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (department) complaint.department = department;

    const evidencePhotoUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (evidencePhotoUrl) {
      complaint.resolvedEvidencePhotoUrl = evidencePhotoUrl;
    }

    await complaint.save();

    const historyRecord = await StatusHistory.create({
      complaintId: complaint._id,
      status: complaint.status,
      note: note || `Status changed to ${complaint.status}`,
      evidencePhotoUrl,
      changedBy: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(200).json({
      complaint,
      statusUpdate: historyRecord,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   POST /api/admin/complaints/:id/merge
 * @desc    Confirm or reject a duplicate suggestion
 * @access  Private (Admin)
 */
router.post('/complaints/:id/merge', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { confirm } = req.body; // true = confirm duplicate, false = reject suggestion

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const rules = await RuleSettings.findOne({ isDefault: true }) || new RuleSettings();
    const sensitiveZones = await SensitiveZone.find({ active: true });

    if (confirm === true) {
      // Confirm duplicate
      complaint.status = 'duplicate';
      await complaint.save();

      await StatusHistory.create({
        complaintId: complaint._id,
        status: 'duplicate',
        note: `Admin confirmed duplicate relationship with report #${complaint.duplicateOf}`,
        changedBy: {
          userId: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
      });
    } else {
      // Reject duplicate suggestion
      const originalId = complaint.duplicateOf;
      complaint.duplicateOf = null;
      complaint.status = 'new';
      await complaint.save();

      if (originalId) {
        const original = await Complaint.findById(originalId);
        if (original && original.duplicateCount > 0) {
          original.duplicateCount = Math.max(0, original.duplicateCount - 1);
          const updatedPriority = calculatePriority(original, rules, sensitiveZones);
          original.priorityScore = updatedPriority.priorityScore;
          original.priorityBand = updatedPriority.priorityBand;
          original.priorityReasons = updatedPriority.priorityReasons;
          await original.save();
        }
      }

      await StatusHistory.create({
        complaintId: complaint._id,
        status: 'new',
        note: 'Admin rejected duplicate suggestion; marked as independent complaint',
        changedBy: {
          userId: req.user._id,
          name: req.user.name,
          role: req.user.role,
        },
      });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Aggregate counts by category, status, and resolution metrics
 * @access  Private (Admin)
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [total, highPriority, resolved, categoryCounts, statusCounts] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ priorityScore: { $gte: 70 } }),
      Complaint.countDocuments({ status: { $in: ['resolved', 'closed', 'Resolved', 'Closed'] } }),
      Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    res.status(200).json({
      total,
      highPriority,
      resolved,
      categories: categoryCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
      statuses: statusCounts.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {}),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   GET /api/admin/rules
 * @desc    Read current priority rule weights and thresholds
 * @access  Private (Admin)
 */
router.get('/rules', async (req, res, next) => {
  try {
    const rules = await RuleSettings.findOne({ isDefault: true }) || await RuleSettings.create({ isDefault: true });
    const sensitiveZones = await SensitiveZone.find();
    res.status(200).json({ rules, sensitiveZones });
  } catch (err) {
    next(err);
  }
});

/**
 * @route   PUT /api/admin/rules
 * @desc    Update priority weights and recalculate scores for open complaints
 * @access  Private (Admin)
 */
router.put('/rules', async (req, res, next) => {
  try {
    const { categoryWeights, duplicateWeight, sensitiveZoneWeight, ageWeight, photoEvidenceWeight, thresholds } = req.body;

    let rules = await RuleSettings.findOne({ isDefault: true });
    if (!rules) rules = new RuleSettings({ isDefault: true });

    if (categoryWeights) rules.categoryWeights = categoryWeights;
    if (duplicateWeight != null) rules.duplicateWeight = duplicateWeight;
    if (sensitiveZoneWeight != null) rules.sensitiveZoneWeight = sensitiveZoneWeight;
    if (ageWeight != null) rules.ageWeight = ageWeight;
    if (photoEvidenceWeight != null) rules.photoEvidenceWeight = photoEvidenceWeight;
    if (thresholds) rules.thresholds = { ...rules.thresholds, ...thresholds };

    await rules.save();

    // Recalculate priority scores for all open complaints
    const sensitiveZones = await SensitiveZone.find({ active: true });
    const openStatuses = ['new', 'under_review', 'assigned', 'in_progress', 'New', 'Under review', 'Assigned', 'In progress'];
    const openComplaints = await Complaint.find({ status: { $in: openStatuses } });

    for (const comp of openComplaints) {
      const updated = calculatePriority(comp, rules, sensitiveZones);
      comp.priorityScore = updated.priorityScore;
      comp.priorityBand = updated.priorityBand;
      comp.priorityReasons = updated.priorityReasons;
      await comp.save();
    }

    res.status(200).json({
      success: true,
      rules,
      recalculatedCount: openComplaints.length,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
