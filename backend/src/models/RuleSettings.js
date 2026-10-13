import mongoose from 'mongoose';

const ruleSettingsSchema = new mongoose.Schema(
  {
    // Category severity scores (factor contributes up to 35 points)
    categoryWeights: {
      type: Map,
      of: Number,
      default: {
        // Spec canonical keys
        'road_damage': 30,
        'water_leakage': 30,
        'blocked_drain': 25,
        'garbage': 20,
        'streetlight': 15,
        'other': 10,
        // UI / Display aliases
        'Road damage': 30,
        'Water leakage': 30,
        'Blocked drains': 25,
        'Garbage and overflowing bins': 20,
        'Streetlight faults': 15,
        'Other': 10,
      },
    },
    // Max weight points
    maxCategoryWeight: { type: Number, default: 35 },
    duplicateWeight: { type: Number, default: 25 },
    sensitiveZoneWeight: { type: Number, default: 20 },
    ageWeight: { type: Number, default: 15 },
    photoEvidenceWeight: { type: Number, default: 5 },

    // Per-unit scoring calculations
    pointsPerDuplicate: { type: Number, default: 5 }, // e.g. 4 duplicates * 5 = +20 pts
    pointsPerDayAge: { type: Number, default: 2 },    // e.g. 3 days old * 2 = +6 pts (up to ageWeight)

    // Thresholds & bounds
    thresholds: {
      highPriority: { type: Number, default: 70 },
      mediumPriority: { type: Number, default: 40 },
      duplicateSimilarityThreshold: { type: Number, default: 0.80 },
      duplicateRadiusMeters: { type: Number, default: 100 },
    },

    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Helper to fetch current active settings or initialize default settings
ruleSettingsSchema.statics.getActiveSettings = async function () {
  let settings = await this.findOne({ isDefault: true });
  if (!settings) {
    settings = await this.create({ isDefault: true });
  }
  return settings;
};

const RuleSettings = mongoose.model('RuleSettings', ruleSettingsSchema);

export default RuleSettings;
