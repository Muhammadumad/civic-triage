const assert = require('assert');
const { classifyByKeywords } = require('../services/classifier');
const { calculateCosineSimilarity, calculateTextSimilarity, generateEmbedding } = require('../services/similarity');
const { calculatePriority } = require('../services/priority');
const { calculateDistanceMeters } = require('../utils/geo');

console.log('--- Running Logic Tests (classifier, similarity, priority, geo) ---');

let passed = 0;
let failed = 0;

const test = (name, fn) => {
  try {
    fn();
    console.log(` PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(` FAIL: ${name}`);
    console.error(err);
    failed++;
  }
};

// ==================== 1. Classifier Tests ====================
test('Classifier: identifies road damage from pothole keyword', () => {
  const result = classifyByKeywords('There is a dangerous deep pothole near the crossing.');
  assert.strictEqual(result.category, 'road_damage');
  assert(result.confidence >= 0.7);
  assert(result.reason.includes('pothole'));
});

test('Classifier: identifies garbage from overflowing bin keyword', () => {
  const result = classifyByKeywords('Huge pile of garbage and overflowing trash bin.');
  assert.strictEqual(result.category, 'garbage');
  assert(result.confidence >= 0.7);
});

test('Classifier: identifies streetlight fault', () => {
  const result = classifyByKeywords('Streetlight is completely broken and the road is dark.');
  assert.strictEqual(result.category, 'streetlight');
});

test('Classifier: identifies water leakage', () => {
  const result = classifyByKeywords('Main water pipe burst and clean water is leaking everywhere.');
  assert.strictEqual(result.category, 'water_leakage');
});

test('Classifier: identifies blocked drain', () => {
  const result = classifyByKeywords('Clogged drain gutter causing dirty sewage on street.');
  assert.strictEqual(result.category, 'blocked_drain');
});

test('Classifier: falls back to "other" with low confidence when no keywords match', () => {
  const result = classifyByKeywords('The park bench paint looks slightly faded.');
  assert.strictEqual(result.category, 'other');
  assert.strictEqual(result.confidence, 0.3);
});

// ==================== 2. Similarity Tests ====================
test('Similarity: Cosine similarity returns 1.0 for identical vectors', () => {
  const vec = [0.6, 0.8];
  const sim = calculateCosineSimilarity(vec, vec);
  assert(Math.abs(sim - 1.0) < 0.001);
});

test('Similarity: Cosine similarity returns 0.0 for orthogonal vectors', () => {
  const vecA = [1, 0];
  const vecB = [0, 1];
  const sim = calculateCosineSimilarity(vecA, vecB);
  assert.strictEqual(sim, 0);
});

test('Similarity: Similar pothole reports score above duplicate threshold (0.50)', () => {
  const text1 = 'Large deep pothole on Main Street near bakery damaging car tires';
  const text2 = 'Severe pothole on Main Street by the bakery, cars swerving';
  const sim = calculateTextSimilarity(text1, text2);
  assert(sim >= 0.50, `Expected similarity >= 0.50, got ${sim}`);
});

test('Similarity: Different issues score below duplicate threshold', () => {
  const text1 = 'Large deep pothole on Main Street';
  const text2 = 'Dark street because streetlight bulb is dead on 5th Avenue';
  const sim = calculateTextSimilarity(text1, text2);
  assert(sim < 0.40, `Expected similarity < 0.40, got ${sim}`);
});

// ==================== 3. Geo Tests ====================
test('Geo: Haversine distance correctly computes zero for same point', () => {
  const dist = calculateDistanceMeters(24.8607, 67.0011, 24.8607, 67.0011);
  assert.strictEqual(dist, 0);
});

test('Geo: Haversine distance recognizes points within 150m radius', () => {
  // Coordinates separated by ~60 meters
  const dist = calculateDistanceMeters(24.8607, 67.0011, 24.8612, 67.0013);
  assert(dist > 0 && dist < 150, `Expected distance < 150m, got ${dist}m`);
});

// ==================== 4. Priority Scoring Tests ====================
test('Priority: Correct score calculation with category, duplicates, sensitive zone, age, photo', () => {
  const mockRules = {
    categoryWeights: { road_damage: 30, other: 10 },
    maxCategoryWeight: 35,
    duplicateWeight: 25,
    sensitiveZoneWeight: 20,
    ageWeight: 15,
    photoEvidenceWeight: 5,
    pointsPerDuplicate: 5,
    pointsPerDayAge: 2,
    thresholds: { highPriority: 70, mediumPriority: 40 },
  };

  const sensitiveZones = [
    { name: 'City Hospital', type: 'hospital', lat: 24.8607, lng: 67.0011, radius: 150, active: true },
  ];

  // Complaint right by hospital, 2 duplicates, 2 days old, with photo
  const complaint = {
    category: 'road_damage',
    duplicateCount: 2, // 2 * 5 = +10
    location: { lat: 24.8609, lng: 67.0012 }, // ~30m from hospital -> +20
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days -> +4
    photoUrl: '/uploads/pothole.jpg', // +5
  };

  const result = calculatePriority(complaint, mockRules, sensitiveZones);

  // Expected score: 30 (cat) + 10 (dup) + 20 (zone) + 4 (age) + 5 (photo) = 69 -> Medium (since < 70)
  assert.strictEqual(result.priorityScore, 69);
  assert.strictEqual(result.priorityBand, 'Medium');
  assert.strictEqual(result.priorityReasons.length, 5);
});

test('Priority: Score reaches High band (>=70) when duplicates increase', () => {
  const mockRules = {
    categoryWeights: { road_damage: 30 },
    maxCategoryWeight: 35,
    duplicateWeight: 25,
    sensitiveZoneWeight: 20,
    ageWeight: 15,
    photoEvidenceWeight: 5,
    pointsPerDuplicate: 5,
    pointsPerDayAge: 2,
    thresholds: { highPriority: 70, mediumPriority: 40 },
  };

  const sensitiveZones = [
    { name: 'Govt School', type: 'school', lat: 24.8607, lng: 67.0011, radius: 150, active: true },
  ];

  const complaint = {
    category: 'road_damage',
    duplicateCount: 4, // 4 * 5 = +20
    location: { lat: 24.8608, lng: 67.0012 }, // by school -> +20
    photoUrl: '/uploads/photo.jpg', // +5
  };

  // Score: 30 + 20 + 20 + 5 = 75 -> High
  const result = calculatePriority(complaint, mockRules, sensitiveZones);
  assert(result.priorityScore >= 70);
  assert.strictEqual(result.priorityBand, 'High');
});

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('All logic tests passed successfully!\n');
}
