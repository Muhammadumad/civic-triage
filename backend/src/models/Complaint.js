import mongoose from 'mongoose';

export const COMPLAINT_CATEGORIES = [
  'road_damage',
  'garbage',
  'streetlight',
  'water_leakage',
  'blocked_drain',
  'other',
  'Road damage',
  'Garbage and overflowing bins',
  'Streetlight faults',
  'Water leakage',
  'Blocked drains',
  'Other',
];

export const COMPLAINT_STATUSES = [
  'new',
  'under_review',
  'assigned',
  'in_progress',
  'resolved',
  'closed',
  'duplicate',
  'rejected',
  'New',
  'Under review',
  'Assigned',
  'In progress',
  'Resolved',
  'Closed',
  'Duplicate',
  'Rejected',
];

export const PRIORITY_BANDS = ['low', 'medium', 'high', 'Low', 'Medium', 'High'];

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: COMPLAINT_CATEGORIES,
      default: 'Other',
    },
    aiCategory: {
      type: String,
      enum: COMPLAINT_CATEGORIES,
      default: null,
    },
    aiConfidence: {
      type: Number,
      min: 0,
      max: 1,
      default: null,
    },
    photoUrl: {
      type: String,
      default: null,
    },
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
      address: {
        type: String,
        trim: true,
        default: 'Location specified on map',
      },
      // GeoJSON Point for geospatial queries (e.g. radius duplicate lookup)
      geo: {
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
    },
    // Dense vector embedding representation for semantic similarity duplicate detection
    embedding: {
      type: [Number],
      default: [],
      select: false, // Don't return heavy embedding array unless explicitly selected
    },
    status: {
      type: String,
      enum: COMPLAINT_STATUSES,
      default: 'New',
      index: true,
    },
    priorityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    priorityBand: {
      type: String,
      enum: PRIORITY_BANDS,
      default: 'Low',
    },
    priorityReasons: {
      type: [String],
      default: [],
    },
    duplicateOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Complaint',
      default: null,
    },
    duplicateCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    department: {
      type: String,
      trim: true,
      default: 'General Works',
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    residentContact: {
      name: { type: String, trim: true, default: 'Anonymous Resident' },
      phone: { type: String, trim: true, default: '' },
      email: { type: String, trim: true, default: '' },
    },
    resolvedEvidencePhotoUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 2dsphere index for radius/geospatial queries (100m duplicate radius detection)
complaintSchema.index({ 'location.geo': '2dsphere' });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ createdAt: -1 });

// Ensure GeoJSON coordinates match lat and lng before saving
complaintSchema.pre('save', function (next) {
  if (this.location && this.location.lat != null && this.location.lng != null) {
    this.location.geo = {
      type: 'Point',
      coordinates: [this.location.lng, this.location.lat],
    };
  }

  // Derive priority band from priorityScore (Section 8: >=70 High, 40-69 Medium, <40 Low)
  if (this.priorityScore >= 70) {
    this.priorityBand = 'High';
  } else if (this.priorityScore >= 40) {
    this.priorityBand = 'Medium';
  } else {
    this.priorityBand = 'Low';
  }

  // Autogenerate title if empty
  if (!this.title && this.description) {
    this.title = this.description.slice(0, 45) + (this.description.length > 45 ? '...' : '');
  }

  next();
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
