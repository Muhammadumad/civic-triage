const STOP_WORDS = new Set([
  'the',
  'a',
  'an',
  'in',
  'on',
  'at',
  'to',
  'for',
  'of',
  'and',
  'or',
  'is',
  'are',
  'was',
  'were',
  'by',
  'near',
  'from',
  'with',
  'because',
  'this',
  'that',
  'it',
  'there',
  'be',
  'as',
]);

/**
 * Compute cosine similarity between two numeric vectors
 * Sc = (A . B) / (||A|| * ||B||)
 */
const calculateCosineSimilarity = (vecA = [], vecB = []) => {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return Number((dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))).toFixed(4));
};

/**
 * Tokenize text, remove stop words, and stem common suffixes
 */
const tokenizeAndStem = (text = '') => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return words.map((w) => w.replace(/(ing|ed|es|s)$/, ''));
};

/**
 * Generate 128-dimensional term-frequency vector embedding
 */
const generateEmbedding = (text = '') => {
  const dims = 128;
  const vector = new Array(dims).fill(0);
  const stems = tokenizeAndStem(text);

  if (!stems.length) return vector;

  stems.forEach((stem) => {
    let hash = 0;
    for (let i = 0; i < stem.length; i++) {
      hash = (hash << 5) - hash + stem.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % dims;
    vector[index] += 1;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dims; i++) {
      vector[i] = Number((vector[i] / magnitude).toFixed(6));
    }
  }

  return vector;
};

/**
 * Calculate token-frequency cosine similarity between two descriptions
 * @returns {number} Value between 0.0 and 1.0
 */
const calculateTextSimilarity = (textA = '', textB = '') => {
  if (!textA || !textB) return 0;
  if (textA.trim().toLowerCase() === textB.trim().toLowerCase()) return 1.0;

  const stemsA = tokenizeAndStem(textA);
  const stemsB = tokenizeAndStem(textB);

  if (!stemsA.length || !stemsB.length) return 0;

  // Build combined vocabulary
  const vocab = Array.from(new Set([...stemsA, ...stemsB]));
  const freqA = new Array(vocab.length).fill(0);
  const freqB = new Array(vocab.length).fill(0);

  stemsA.forEach((w) => {
    const idx = vocab.indexOf(w);
    if (idx !== -1) freqA[idx] += 1;
  });

  stemsB.forEach((w) => {
    const idx = vocab.indexOf(w);
    if (idx !== -1) freqB[idx] += 1;
  });

  return calculateCosineSimilarity(freqA, freqB);
};

module.exports = {
  calculateCosineSimilarity,
  generateEmbedding,
  calculateTextSimilarity,
};
