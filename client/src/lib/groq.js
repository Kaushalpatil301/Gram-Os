import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

/**
 * Analyzes a crop image using Groq Vision API
 * @param {string} base64Image - Base64 encoded image string
 * @returns {Promise<Object>} - Structured JSON analysis report
 */
export async function analyzeCropImage(base64Image) {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this agricultural produce image and provide a highly technical quality report in JSON format. Include: crop_name, variety, quality_score (1-10), quality_grade (A/B/C), freshness_rating, estimated_weight_range, key_features (array of 3), storage_advice, market_suitability, listing_title, and listing_description. Be precise and agrarian-focused.",
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      model: "llama-3.2-11b-vision-preview",
      response_format: { type: "json_object" },
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
}
