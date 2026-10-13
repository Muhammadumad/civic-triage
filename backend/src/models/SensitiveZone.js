const mongoose = require('mongoose');

const SENSITIVE_ZONE_TYPES = ['school', 'hospital', 'main road', 'other'];

const sensitiveZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sensitive zone name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: SENSITIVE_ZONE_TYPES,
      default: 'other',
      index: true,
    },
    lat: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    lng: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    radius: {
      type: Number,
      required: [true, 'Radius in meters is required'],
      default: 150,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        default: [0, 0],
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

sensitiveZoneSchema.index({ location: '2dsphere' });

sensitiveZoneSchema.pre('save', function (next) {
  if (this.lat != null && this.lng != null) {
    this.location = {
      type: 'Point',
      coordinates: [this.lng, this.lat],
    };
  }
  next();
});

const SensitiveZone = mongoose.model('SensitiveZone', sensitiveZoneSchema);

module.exports = {
  SensitiveZone,
  SENSITIVE_ZONE_TYPES,
};
