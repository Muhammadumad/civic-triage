const CATEGORY_DEFINITIONS = {
  road_damage: {
    specific: ['pothole', 'potholes', 'crater', 'asphalt', 'pavement', 'sinkhole', 'broken road', 'road damage'],
    general: ['road', 'roads', 'crack', 'cracks', 'bump', 'bumps', 'bitumen'],
  },
  garbage: {
    specific: ['garbage', 'trash', 'waste', 'dumping', 'rubbish', 'overflowing bin', 'littering'],
    general: ['bin', 'bins', 'litter', 'dump', 'debris', 'overflowing', 'filth'],
  },
  streetlight: {
    specific: ['streetlight', 'streetlights', 'street light', 'street lights', 'lamp post', 'light pole', 'lamppost', 'blackout'],
    general: ['lamp', 'light', 'lights', 'dark', 'bulb', 'pole', 'lighting'],
  },
  water_leakage: {
    specific: ['water leak', 'pipe burst', 'water leakage', 'burst pipe', 'gushing water', 'water main'],
    general: ['water', 'leak', 'leaks', 'leakage', 'pipe', 'pipes', 'burst', 'flooding', 'tap'],
  },
  blocked_drain: {
    specific: ['blocked drain', 'clogged drain', 'sewage', 'sewer', 'manhole overflow', 'drain blockage'],
    general: ['drain', 'drains', 'gutter', 'gutters', 'clogged', 'blockage', 'drainage', 'manhole'],
  },
};

/**
 * Local keyword-based classifier that never fails or times out
 * Weighted scoring: specific domain terms get 2 points, general terms get 1 point
 */
const classifyByKeywords = (text = '') => {
  const normalized = text.toLowerCase();
  let bestCategory = 'other';
  let bestScore = 0;
  let matchedKeyword = '';

  for (const [category, def] of Object.entries(CATEGORY_DEFINITIONS)) {
    let score = 0;

    for (const kw of def.specific) {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalized)) {
        score += 2;
        if (!matchedKeyword) matchedKeyword = kw;
      }
    }

    for (const kw of def.general) {
      const regex = new RegExp(`\\b${kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(normalized)) {
        score += 1;
        if (!matchedKeyword) matchedKeyword = kw;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  if (bestScore === 0) {
    return {
      category: 'other',
      confidence: 0.3,
      reason: 'No category keywords matched; marked as other for staff triage',
    };
  }

  const confidence = Math.min(0.95, 0.65 + bestScore * 0.08);
  const formattedCategory = bestCategory.replace('_', ' ');

  return {
    category: bestCategory,
    confidence: Number(confidence.toFixed(2)),
    reason: `Matched keyword "${matchedKeyword}" associated with ${formattedCategory}`,
  };
};

const classifyComplaint = async (text = '', imageUrl = null) => {
  return classifyByKeywords(text);
};

module.exports = {
  classifyComplaint,
  classifyByKeywords,
  CATEGORY_DEFINITIONS,
};
