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

module.exports = {
  analyzeComplaintWithGemini,
  VALID_CATEGORIES,
};
