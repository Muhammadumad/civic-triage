const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const VALID_CATEGORIES = [
  'road_damage', 'garbage', 'streetlight', 'water_leakage', 'blocked_drain', 'other',
];

const DEFAULT_CANDIDATE_MODELS = [
  'gemini-2.0-flash',           // fast, free tier, multimodal
  'gemini-2.0-flash-lite',      // fastest, lowest cost
  'gemini-1.5-flash',           // stable fallback
  'gemini-1.5-flash-latest',    // alias
  'gemini-1.5-pro',             // high accuracy fallback
];

let aiClient = null;
let activeApiKey = null;
let lastFallbackReason = null;

function setLastFallbackReason(reason) {
  lastFallbackReason = reason;
}

function getLastFallbackReason() {
  return lastFallbackReason;
}

/**
 * Safely extracts HTTP status code from Gemini / GoogleGenAI errors.
 */
function extractHttpStatus(err) {
  if (!err) return 'Unknown';
  if (typeof err.status === 'number' || (typeof err.status === 'string' && /^\d+$/.test(err.status))) {
    return Number(err.status);
  }
  if (typeof err.statusCode === 'number') return err.statusCode;
  if (err.response && (err.response.status || err.response.statusCode)) {
    return err.response.status || err.response.statusCode;
  }
  if (err.error && (err.error.code || err.error.status)) {
    return err.error.code || err.error.status;
  }
  return 'Unknown';
}

/**
 * Sanitizes any string or error message to strictly prevent logging secret API keys.
 */
function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') return '';
  let sanitized = message;
  const currentKey = getGeminiApiKey();
  if (currentKey) {
    sanitized = sanitized.split(currentKey).join('[REDACTED]');
  }
  return sanitized
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]')
    .replace(/(key=)[^&\s"'`]+/gi, '$1[REDACTED]');
}

/**
 * Cleanly extracts and normalizes the Gemini API key from environment variables.
 * Handles common production environment issues like surrounding quotes, whitespace,
 * or alternate variable names (e.g. GOOGLE_API_KEY).
 */
function getGeminiApiKey() {
  const rawKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    '';

  if (!rawKey || typeof rawKey !== 'string') {
    return null;
  }

  // Strip leading and trailing quotes (common when copy-pasting into production envs) and trim
  const cleanKey = rawKey.trim().replace(/^['"]+|['"]+$/g, '').trim();

  if (
    !cleanKey ||
    cleanKey === 'your_gemini_api_key_here' ||
    cleanKey === 'undefined' ||
    cleanKey === 'null'
  ) {
    return null;
  }

  return cleanKey;
}

/**
 * Returns prioritized list of Gemini models to attempt.
 */
function getCandidateModels() {
  const customModel = (process.env.GEMINI_MODEL || '').trim().replace(/^['"]+|['"]+$/g, '');
  const list = [customModel, ...DEFAULT_CANDIDATE_MODELS].filter(Boolean);
  return Array.from(new Set(list));
}

/**
 * Lazily creates or refreshes the Google GenAI client.
 */
function getAIClient() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  if (!aiClient || activeApiKey !== apiKey) {
    aiClient = new GoogleGenAI({ apiKey });
    activeApiKey = apiKey;
  }
  return aiClient;
}

/**
 * Executes a promise with an enforced timeout.
 */
function withTimeout(promise, ms = 7000) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}

/**
 * Resolves local path or remote URL into an inline image part for Gemini.
 */
async function loadImagePart(photoPath) {
  if (!photoPath || typeof photoPath !== 'string') return null;

  try {
    let mimeType = 'image/jpeg';
    let base64Data = null;

    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      const res = await withTimeout(fetch(photoPath), 5000);
      if (!res.ok) return null;
      const contentType = res.headers.get('content-type') || '';
      mimeType = contentType.includes('png') ? 'image/png' : contentType.includes('webp') ? 'image/webp' : 'image/jpeg';
      const arrayBuf = await res.arrayBuffer();
      base64Data = Buffer.from(arrayBuf).toString('base64');
    } else if (photoPath.startsWith('data:image/')) {
      const matches = photoPath.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    } else {
      let resolved = photoPath;
      if (!fs.existsSync(resolved)) {
        const candidate = path.join(path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads'), path.basename(photoPath));
        if (fs.existsSync(candidate)) resolved = candidate;
        else return null;
      }
      const ext = path.extname(resolved).toLowerCase();
      mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      base64Data = fs.readFileSync(resolved).toString('base64');
    }

    if (base64Data) {
      return { inlineData: { mimeType, data: base64Data } };
    }
  } catch (err) {
    console.warn('[Gemini AI] Could not attach image buffer:', err.message);
  }
  return null;
}

/**
 * Multimodal inspection of municipal complaint using Gemini LLM.
 * Returns null on any failure to guarantee zero-downtime local fallback.
 */
async function analyzeComplaintWithGemini({ title, description, photoPath }) {
  const client = getAIClient();
  if (!client) {
    const reason = 'GEMINI_API_KEY is not configured or is a placeholder';
    setLastFallbackReason(reason);
    console.warn(`[Gemini AI] Engaging local classifier fallback. Reason: ${reason}`);
    return null;
  }

  try {
    const contents = [];
    const imagePart = await loadImagePart(photoPath);
    if (imagePart) contents.push(imagePart);

    const promptText = `Municipal civic triage specialist. Analyze report:
Title: "${title || 'Untitled'}"
Description: "${description || 'No description provided'}"
Return JSON:
{
  "category": "road_damage" | "garbage" | "streetlight" | "water_leakage" | "blocked_drain" | "other",
  "confidence": 0.95,
  "visualHazardSummary": "Hazard description in 1 sentence",
  "recommendedDepartment": "Dept of Public Works & Roads",
  "recommendedAction": "Action plan"
}`;

    contents.push({ text: promptText });

    let responseText = null;
    let successfulModel = null;
    let lastError = null;

    const candidateModels = getCandidateModels();

    for (const model of candidateModels) {
      try {
        const response = await withTimeout(
          client.models.generateContent({
            model,
            contents,
            config: { responseMimeType: 'application/json' },
          }),
          7000
        );

        if (response && response.text) {
          responseText = response.text;
          successfulModel = model;
          break;
        }
      } catch (err) {
        lastError = err;
        const status = extractHttpStatus(err);
        const errorMsg = sanitizeErrorMessage(err.message || String(err));
        console.error(`[Gemini AI] Error (HTTP ${status}): ${errorMsg}`);
      }
    }

    if (!responseText) {
      const status = extractHttpStatus(lastError);
      const reason = lastError
        ? `LLM call failed across models (HTTP ${status}): ${sanitizeErrorMessage(lastError.message)}`
        : 'No response received from candidate Gemini models';
      setLastFallbackReason(reason);
      console.warn(`[Gemini AI] Engaging local classifier fallback. Reason: ${reason}`);
      return null;
    }

    const parsed = JSON.parse(responseText);
    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'other';
    const confidence = typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.5, parsed.confidence)) : 0.85;

    return {
      category,
      confidence,
      reason: parsed.visualHazardSummary || 'Analyzed via Gemini multimodal vision',
      visualHazardSummary: parsed.visualHazardSummary || null,
      recommendedDepartment: parsed.recommendedDepartment || null,
      recommendedAction: parsed.recommendedAction || null,
      isLLM: true,
      aiSource: 'gemini',
      modelUsed: successfulModel || candidateModels[0],
    };
  } catch (err) {
    const status = extractHttpStatus(err);
    const errorMsg = sanitizeErrorMessage(err.message || String(err));
    console.error(`[Gemini AI] Error (HTTP ${status}): ${errorMsg}`);
    const reason = `Inspection failed (HTTP ${status}): ${errorMsg}`;
    setLastFallbackReason(reason);
    console.warn(`[Gemini AI] Engaging local classifier fallback. Reason: ${reason}`);
    return null;
  }
}

/**
 * Pre-submission multimodal analysis of an uploaded image to auto-populate complaint form
 */
async function analyzeImageWithGemini({ photoPath, imageBuffer, mimeType }) {
  const client = getAIClient();
  if (!client) return null;

  try {
    let buf = imageBuffer;
    let mType = mimeType || 'image/jpeg';

    if (!buf && photoPath && fs.existsSync(photoPath)) {
      const ext = path.extname(photoPath).toLowerCase();
      mType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      buf = fs.readFileSync(photoPath);
    }
    if (!buf) return null;

    const contents = [
      { inlineData: { mimeType, data: buf.toString('base64') } },
      {
        text: `Expert municipal infrastructure inspector. Inspect photo and return JSON:
{
  "category": "road_damage" | "garbage" | "streetlight" | "water_leakage" | "blocked_drain" | "other",
  "title": "Incident Title",
  "description": "2-3 sentence description of hazard and damage",
  "confidence": 0.95,
  "visualHazardSummary": "Specific damage detail in 1 sentence",
  "recommendedDepartment": "Dept of Public Works & Roads"
}`,
      },
    ];

    let responseText = null;
    const candidateModels = getCandidateModels();
    for (const model of candidateModels) {
      try {
        const response = await withTimeout(
          client.models.generateContent({
            model,
            contents,
            config: { responseMimeType: 'application/json' },
          }),
          7000
        );
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        const status = extractHttpStatus(err);
        const errorMsg = sanitizeErrorMessage(err.message || String(err));
        console.error(`[Gemini AI] Model ${model} failed (HTTP ${status}): ${errorMsg}`);
      }
    }

    if (!responseText) return null;

    let parsed = JSON.parse(responseText);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed = parsed[0];
    }

    const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'other';
    const confidence = typeof parsed.confidence === 'number' ? Math.min(0.99, Math.max(0.5, parsed.confidence)) : 0.92;

    return {
      category,
      title: parsed.title || 'Civic Infrastructure Hazard',
      description: parsed.description || 'Civic infrastructure defect identified from photographic evidence.',
      confidence,
      visualHazardSummary: parsed.visualHazardSummary || null,
      recommendedDepartment: parsed.recommendedDepartment || 'Dept of Public Works & Roads',
      isLLM: true,
      aiSource: 'gemini',
      modelUsed: 'gemini-3.5-flash-lite',
    };
  } catch (err) {
    const status = extractHttpStatus(err);
    const errorMsg = sanitizeErrorMessage(err.message || String(err));
    console.error(`[Gemini AI] Error (HTTP ${status}): ${errorMsg}`);
    return null;
  }
}

/**
 * Diagnostics check for production health monitoring.
 */
async function checkGeminiStatus() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      configured: false,
      status: 'offline_fallback',
      message: 'No GEMINI_API_KEY detected. Running on local keyword classifier.',
    };
  }

  const client = getAIClient();
  if (!client) {
    return {
      configured: false,
      status: 'error',
      message: 'Client initialization failed.',
    };
  }

  return {
    configured: true,
    status: 'ready',
    activeModels: getCandidateModels(),
    keyMasked: apiKey.length > 8 ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : '****',
  };
}

module.exports = {
  analyzeComplaintWithGemini,
  analyzeImageWithGemini,
  checkGeminiStatus,
  getGeminiApiKey,
  getCandidateModels,
  getLastFallbackReason,
  extractHttpStatus,
  sanitizeErrorMessage,
  VALID_CATEGORIES,
};
