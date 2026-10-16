const fs = require('fs');
const path = require('path');
const { GoogleGenAI } = require('@google/genai');

const VALID_CATEGORIES = [
  'road_damage',
  'garbage',
  'streetlight',
  'water_leakage',
  'blocked_drain',
  'other',
];

const DEFAULT_CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

let aiClient = null;
let activeApiKey = null;

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
        const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
        const candidate = path.join(uploadDir, path.basename(photoPath));
        if (fs.existsSync(candidate)) {
          resolved = candidate;
        } else {
          return null;
        }
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
    return null; // Local keyword fallback
  }

  try {
    const contents = [];

    // Multimodal image inspection (supports local disk files and remote URLs)
    const imagePart = await loadImagePart(photoPath);
    if (imagePart) {
      contents.push(imagePart);
    }

    const promptText = `You are an automated civic triage specialist inspecting a municipal complaint.
Analyze the following incident report:
Title: "${title || 'Untitled'}"
Description: "${description || 'No description provided'}"

Instructions:
1. Select the most accurate category strictly from: ["road_damage", "garbage", "streetlight", "water_leakage", "blocked_drain", "other"].
2. Provide a confidence score between 0.50 and 0.99.
3. If an image is attached, describe the specific visual damage or physical hazard visible in 1 clear sentence. Otherwise, summarize the described hazard.
4. Recommend the municipal department and immediate field action.

Return valid JSON in this exact structure:
{
  "category": "road_damage" | "garbage" | "streetlight" | "water_leakage" | "blocked_drain" | "other",
  "confidence": 0.95,
  "visualHazardSummary": "Deep 14-inch asphalt subsidence with loose gravel in active traffic lane.",
  "recommendedDepartment": "Dept of Public Works & Roads",
  "recommendedAction": "Dispatch asphalt cold-patch crew with high-visibility safety barriers."
}`;

    contents.push({ text: promptText });

    // Try candidate models with graceful failover
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
            config: {
              responseMimeType: 'application/json',
            },
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
        // Continue to next candidate model on 503/404/rate-limit
      }
    }

    if (!responseText) {
      if (lastError) {
        console.warn('[Gemini AI] LLM call failed across models, engaging local classifier fallback:', lastError.message);
      }
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
      modelUsed: successfulModel || candidateModels[0],
    };
  } catch (err) {
    console.warn('[Gemini AI] Inspection failed, engaging local classifier fallback:', err.message);
    return null;
  }
}

/**
/**
 * Pre-submission multimodal analysis of an uploaded image to auto-populate complaint form
 */
async function analyzeImageWithGemini({ photoPath, imageBuffer, mimeType }) {
  const client = getAIClient();
  if (!client) {
    return null;
  }

  try {
    let buf = imageBuffer;
    let mType = mimeType || 'image/jpeg';

    if (!buf && photoPath && fs.existsSync(photoPath)) {
      const ext = path.extname(photoPath).toLowerCase();
      mType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      buf = fs.readFileSync(photoPath);
    }

    if (!buf) {
      return null;
    }

    const contents = [
      {
        inlineData: {
          mimeType: mType,
          data: buf.toString('base64'),
        },
      },
      {
        text: `You are an expert municipal infrastructure inspector analyzing a photo of a civic hazard reported by a resident.
Inspect the photo and return strict JSON with:
1. "category": exactly one of ["road_damage", "garbage", "streetlight", "water_leakage", "blocked_drain", "other"].
2. "title": a concise, formal incident title (under 50 characters, e.g., "Deep Pothole on Asphalt Roadway").
3. "description": a clear 2-3 sentence factual description of the hazard, damage extent, and potential safety risk to pedestrians or vehicles.
4. "confidence": float between 0.60 and 0.99 reflecting certainty.
5. "visualHazardSummary": 1 sentence specific damage detail.
6. "recommendedDepartment": the relevant municipal authority.

Return JSON in this format:
{
  "category": "road_damage",
  "title": "Severe Pothole near Crosswalk",
  "description": "Deep asphalt crater with exposed aggregate causing vehicle swerving and hazard to pedestrians.",
  "confidence": 0.96,
  "visualHazardSummary": "Approx 12-inch wide asphalt cavity with standing rainwater.",
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
            config: {
              responseMimeType: 'application/json',
            },
          }),
          7000
        );
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        console.warn(`[Gemini AI] Model ${model} failed for image inspection:`, err.message);
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
      modelUsed: 'gemini-3.5-flash-lite',
    };
  } catch (err) {
    console.warn('[Gemini AI] analyzeImageWithGemini failed:', err.message);
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
  VALID_CATEGORIES,
};
