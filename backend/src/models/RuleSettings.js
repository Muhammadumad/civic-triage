const mongoose = require('mongoose');

const ruleSettingsSchema = new mongoose.Schema(
  {
    categoryWeights: {
      type: Map,
      of: Number,
      default: {
        'road_damage': 30,
        'water_leakage': 30,
        'blocked_drain': 25,
        'garbage': 20,
        'streetlight': 15,
        'other': 10,
        'Road damage': 30,
        'Water leakage': 30,
        'Blocked drains': 25,
        'Garbage and overflowing bins': 20,
        'Streetlight faults': 15,
        'Other': 10,
      },
    },
    maxCategoryWeight: { type: Number, default: 35 },
    duplicateWeight: { type: Number, default: 25 },
    sensitiveZoneWeight: { type: Number, default: 20 },
    ageWeight: { type: Number, default: 15 },
    photoEvidenceWeight: { type: Number, default: 5 },

    pointsPerDuplicate: { type: Number, default: 5 },
    pointsPerDayAge: { type: Number, default: 2 },

    thresholds: {
      highPriority: { type: Number, default: 70 },
      mediumPriority: { type: Number, default: 40 },
      duplicateSimilarityThreshold: { type: Number, default: 0.50 },
      duplicateRadiusMeters: { type: Number, default: 150 },
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

ruleSettingsSchema.statics.getActiveSettings = async function () {
  let settings = await this.findOne({ isDefault: true });
  if (!settings) {
    settings = await this.create({ isDefault: true });
  }
  return settings;
};

const RuleSettings = mongoose.model('RuleSettings', ruleSettingsSchema);

module.exports = RuleSettings;
