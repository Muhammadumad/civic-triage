const { calculateDistanceMeters } = require('../utils/geo');

/**
 * Calculate dynamic priority score and reasons list based on configurable rules
 * @param {object} complaint - Complaint data
 * @param {object} ruleSettings - Active RuleSettings document
 * @param {Array} sensitiveZones - List of registered sensitive zones
 * @returns {{ priorityScore: number, priorityBand: string, priorityReasons: string[] }}
 */
const calculatePriority = (complaint, ruleSettings, sensitiveZones = []) => {
  const reasons = [];
  let totalScore = 0;

  // 1. Category severity weight (up to maxCategoryWeight, default 35)
  const categoryKey = complaint.category || 'other';
  let catWeight = 10;

  if (ruleSettings.categoryWeights) {
    if (typeof ruleSettings.categoryWeights.get === 'function') {
      catWeight = ruleSettings.categoryWeights.get(categoryKey) ?? 10;
    } else {
      catWeight = ruleSettings.categoryWeights[categoryKey] ?? 10;
    }
  }

  const effectiveCatWeight = Math.min(ruleSettings.maxCategoryWeight || 35, catWeight);
  totalScore += effectiveCatWeight;
  const readableCategory = categoryKey.replace('_', ' ');
  reasons.push(`${readableCategory} severity (+${effectiveCatWeight})`);

  // 2. Duplicate count weight (up to duplicateWeight, default 25)
  const dupCount = complaint.duplicateCount || 0;
  if (dupCount > 0) {
    const pointsPerDup = ruleSettings.pointsPerDuplicate || 5;
    const maxDupWeight = ruleSettings.duplicateWeight || 25;
    const dupScore = Math.min(maxDupWeight, dupCount * pointsPerDup);
    totalScore += dupScore;
    reasons.push(`${dupCount} duplicate report${dupCount > 1 ? 's' : ''} (+${dupScore})`);
  }

  // 3. Proximity to sensitive zones (schools, hospitals, main roads) (up to sensitiveZoneWeight, default 20)
  if (complaint.location && complaint.location.lat != null && complaint.location.lng != null && sensitiveZones.length) {
    let closestZone = null;
    let closestDistance = Infinity;

    for (const zone of sensitiveZones) {
      if (zone.active === false) continue;
      const dist = calculateDistanceMeters(complaint.location.lat, complaint.location.lng, zone.lat, zone.lng);
      const influenceRadius = zone.radius || 150;

      if (dist <= influenceRadius && dist < closestDistance) {
        closestDistance = dist;
        closestZone = zone;
      }
    }

    if (closestZone) {
      const zoneWeight = ruleSettings.sensitiveZoneWeight || 20;
      totalScore += zoneWeight;
      reasons.push(`${closestDistance}m from ${closestZone.name} (${closestZone.type}) (+${zoneWeight})`);
    }
  }

  // 4. Age of complaint weight (up to ageWeight, default 15)
  if (complaint.createdAt) {
    const ageMs = Date.now() - new Date(complaint.createdAt).getTime();
    const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    if (ageDays > 0) {
      const pointsPerDay = ruleSettings.pointsPerDayAge || 2;
      const maxAgeWeight = ruleSettings.ageWeight || 15;
      const ageScore = Math.min(maxAgeWeight, ageDays * pointsPerDay);
      totalScore += ageScore;
      reasons.push(`${ageDays} day${ageDays > 1 ? 's' : ''} old (+${ageScore})`);
    }
  }

  // 5. Photo evidence proof (up to photoEvidenceWeight, default 5)
  if (complaint.photoUrl) {
    const photoWeight = ruleSettings.photoEvidenceWeight || 5;
    totalScore += photoWeight;
    reasons.push(`verified with photo (+${photoWeight})`);
  }

  // Cap between 0 and 100
  const finalScore = Math.min(100, Math.max(0, Math.round(totalScore)));

  // Bands from thresholds: >= 70 High, 40-69 Medium, < 40 Low
  const highThreshold = (ruleSettings.thresholds && ruleSettings.thresholds.highPriority) || 70;
  const medThreshold = (ruleSettings.thresholds && ruleSettings.thresholds.mediumPriority) || 40;

  let priorityBand = 'Low';
  if (finalScore >= highThreshold) {
    priorityBand = 'High';
  } else if (finalScore >= medThreshold) {
    priorityBand = 'Medium';
  }

  return {
    priorityScore: finalScore,
    priorityBand,
    priorityReasons: reasons,
  };
};

module.exports = {
  calculatePriority,
};
