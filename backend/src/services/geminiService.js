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

const CANDIDATE_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash'];

let aiClient = null;

function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
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

    // Optional multimodal image inspection
    if (photoPath && fs.existsSync(photoPath)) {
      try {
        const ext = path.extname(photoPath).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        const imageBuffer = fs.readFileSync(photoPath);

        contents.push({
          inlineData: {
            mimeType,
            data: imageBuffer.toString('base64'),
          },
        });
      } catch (imgErr) {
        console.warn('[Gemini AI] Could not attach image buffer:', imgErr.message);
      }
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

    // Try candidate models
    let responseText = null;
    let lastError = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
        if (response && response.text) {
          responseText = response.text;
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!responseText) {
      if (lastError) {
        console.warn('[Gemini AI] LLM call failed, engaging local classifier fallback:', lastError.message);
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
      modelUsed: 'gemini-3.5-flash-lite',
    };
  } catch (err) {
    console.warn('[Gemini AI] Inspection failed, engaging local classifier fallback:', err.message);
    return null;
  }
}

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
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await client.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });
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

module.exports = {
  analyzeComplaintWithGemini,
  analyzeImageWithGemini,
  VALID_CATEGORIES,
};
