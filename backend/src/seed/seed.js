require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const { Complaint } = require('../models/Complaint');
const StatusHistory = require('../models/StatusHistory');
const RuleSettings = require('../models/RuleSettings');
const { SensitiveZone } = require('../models/SensitiveZone');
const { processComplaint } = require('../services/pipeline');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/civic_complaints_db';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB.');

    // 1. Wipe existing data
    await User.deleteMany({});
    await Complaint.deleteMany({});
    await StatusHistory.deleteMany({});
    await RuleSettings.deleteMany({});
    await SensitiveZone.deleteMany({});
    console.log('[Seed] Cleared existing users, complaints, status history, rules, and sensitive zones.');

    // 2. Create Users (Demo admin and resident)
    const adminPasswordHash = await User.hashPassword('admin123');
    const residentPasswordHash = await User.hashPassword('resident123');

    const admin = await User.create({
      name: 'Municipal Admin',
      email: 'admin@demo.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    });

    const resident = await User.create({
      name: 'Demo Resident',
      email: 'resident@demo.com',
      passwordHash: residentPasswordHash,
      role: 'resident',
    });
    console.log('[Seed] Created default users: admin@demo.com, resident@demo.com');

    // 3. Create Default Rules
    const rules = await RuleSettings.create({
      isDefault: true,
      categoryWeights: {
        road_damage: 30,
        water_leakage: 30,
        blocked_drain: 25,
        garbage: 20,
        streetlight: 15,
        other: 10,
      },
      maxCategoryWeight: 35,
      duplicateWeight: 25,
      sensitiveZoneWeight: 20,
      ageWeight: 15,
      photoEvidenceWeight: 5,
      pointsPerDuplicate: 5,
      pointsPerDayAge: 2,
      thresholds: {
        highPriority: 70,
        mediumPriority: 40,
        duplicateSimilarityThreshold: 0.50,
        duplicateRadiusMeters: 150,
      },
    });
    console.log('[Seed] Created default RuleSettings.');

    // 4. Create Sensitive Zones
    const sensitiveZones = await SensitiveZone.create([
      {
        name: 'City General Hospital',
        type: 'hospital',
        lat: 24.8615,
        lng: 67.0099,
        radius: 200,
        active: true,
      },
      {
        name: 'Model Public High School',
        type: 'school',
        lat: 24.8580,
        lng: 67.0150,
        radius: 150,
        active: true,
      },
      {
        name: 'Jinnah Avenue Commercial Highway',
        type: 'main road',
        lat: 24.8650,
        lng: 67.0120,
        radius: 150,
        active: true,
      },
    ]);
    console.log('[Seed] Created 3 sensitive zones.');

    // 5. Seed Primary Complaints via Pipeline
    const sampleComplaints = [
      {
        title: 'Dangerous deep pothole on Jinnah Road',
        description: 'Large deep pothole on Jinnah Road near bakery damaging car tires and causing accidents.',
        lat: 24.8616,
        lng: 67.0101, // Right near City General Hospital
        category: 'road_damage',
        resident: resident._id,
        photoUrl: '/uploads/sample_pothole_1.jpg',
      },
      {
        title: 'Overflowing dumpster at Market Square',
        description: 'Huge pile of garbage and overflowing trash bin rotting in the sun for 3 days.',
        lat: 24.8630,
        lng: 67.0180,
        category: 'garbage',
        resident: resident._id,
        photoUrl: '/uploads/sample_garbage_1.jpg',
      },
      {
        title: 'Broken streetlight pole outside school gate',
        description: 'Streetlight is completely broken and the road is pitch dark outside school gate.',
        lat: 24.8581,
        lng: 67.0151, // Beside Model Public High School
        category: 'streetlight',
        resident: resident._id,
        photoUrl: '/uploads/sample_streetlight_1.jpg',
      },
      {
        title: 'Major water main leakage on 4th Street',
        description: 'Main water pipe burst and clean drinking water is leaking and flooding the road.',
        lat: 24.8670,
        lng: 67.0140,
        category: 'water_leakage',
        resident: resident._id,
        photoUrl: null,
      },
      {
        title: 'Severe clogged drain causing road sewage',
        description: 'Clogged drain gutter with dirty sewage water backing up onto the pedestrian walkway.',
        lat: 24.8590,
        lng: 67.0110,
        category: 'blocked_drain',
        resident: resident._id,
        photoUrl: '/uploads/sample_drain_1.jpg',
      },
    ];

    const createdComplaints = [];
    for (const item of sampleComplaints) {
      const { processedFields } = await processComplaint(item);
      const doc = await Complaint.create(processedFields);
      await StatusHistory.create({
        complaintId: doc._id,
        status: doc.status,
        note: 'Seeded initial report for demo',
        changedBy: { userId: resident._id, name: 'Demo Resident', role: 'resident' },
      });
      createdComplaints.push(doc);
    }
    console.log(`[Seed] Seeded ${createdComplaints.length} primary complaints.`);

    // 6. Submit a duplicate pothole report to test automatic duplicate linking
    const duplicateReport = {
      title: 'Pothole on Jinnah Road damaging vehicles',
      description: 'Severe pothole on Jinnah Road by the bakery, cars swerving dangerously.',
      lat: 24.8617,
      lng: 67.0102, // 15 meters from first pothole!
      category: 'road_damage',
      resident: resident._id,
      photoUrl: '/uploads/sample_pothole_2.jpg',
    };

    const { processedFields: dupFields, duplicateMatch } = await processComplaint(duplicateReport);
    const dupDoc = await Complaint.create(dupFields);

    if (duplicateMatch && duplicateMatch.originalId) {
      const orig = await Complaint.findById(duplicateMatch.originalId);
      if (orig) {
        orig.duplicateCount += 1;
        orig.priorityScore = Math.min(100, orig.priorityScore + 5);
        orig.priorityReasons.push(`1 duplicate report (+5)`);
        await orig.save();
      }
    }

    await StatusHistory.create({
      complaintId: dupDoc._id,
      status: dupDoc.status,
      note: `Auto-linked duplicate of complaint #${duplicateMatch ? duplicateMatch.originalId : 'N/A'}`,
      changedBy: { userId: resident._id, name: 'Demo Resident', role: 'resident' },
    });
    console.log('[Seed] Seeded duplicate complaint demonstrating auto-linking.');

    // 7. Seed one resolved complaint with resolution proof
    const resolvedReport = await Complaint.create({
      title: 'Repaired broken streetlight on Block 4',
      description: 'Streetlight outage resolved by field technicians.',
      category: 'streetlight',
      status: 'resolved',
      priorityScore: 40,
      priorityBand: 'Medium',
      location: { lat: 24.8550, lng: 67.0080, address: 'Block 4 Main Circle' },
      department: 'Electrical Works',
      photoUrl: '/uploads/sample_streetlight_before.jpg',
      resolvedEvidencePhotoUrl: '/uploads/sample_streetlight_after.jpg',
      resident: resident._id,
    });

    await StatusHistory.create([
      {
        complaintId: resolvedReport._id,
        status: 'new',
        note: 'Complaint reported by resident',
        changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        complaintId: resolvedReport._id,
        status: 'assigned',
        note: 'Assigned to Electrical Works department',
        changedBy: { userId: admin._id, name: 'Municipal Admin', role: 'admin' },
        changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        complaintId: resolvedReport._id,
        status: 'in_progress',
        note: 'Technicians on site replacing wiring and bulb fixture',
        changedBy: { userId: admin._id, name: 'Field Lead', role: 'field_staff' },
        changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        complaintId: resolvedReport._id,
        status: 'resolved',
        note: 'Streetlight fixture replaced and verified operational',
        evidencePhotoUrl: '/uploads/sample_streetlight_after.jpg',
        changedBy: { userId: admin._id, name: 'Municipal Admin', role: 'admin' },
        changedAt: new Date(),
      },
    ]);
    console.log('[Seed] Seeded resolved complaint with complete timeline history and resolution photo.');

    console.log('\n--- Seed Database Complete ---');
    console.log('Demo Credentials:');
    console.log('  Admin    : admin@demo.com / admin123');
    console.log('  Resident : resident@demo.com / resident123');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
