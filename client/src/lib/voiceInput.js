const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';

export async function callGeminiViaServer(prompt, useJson = false) {
  try {
    const endpoint = useJson ? '/api/gemini/generate-json' : '/api/gemini/generate';
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini server proxy error:", error);
    throw error;
  }
}

export async function voiceToProduce() {
  const R = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!R) {
    throw new Error("Speech recognition is not supported in this browser");
  }

  const r = new R();
  r.lang = "en-IN";
  r.continuous = false;
  r.interimResults = false;

  return new Promise((resolve, reject) => {
    r.onresult = async (e) => {
      try {
        const text = e.results[0][0].transcript;
        console.log("Voice input:", text);

        const prompt = `
Extract produce information from the user's speech and return ONLY valid JSON with this exact structure:
{
  "name": "crop name",
  "type": "MUST be one of: Vegetable, Fruit, Grain, Leafy Greens, Pulse, Spice, Dairy, Other",
  "quantity": number in kg,
  "basePrice": number in rupees per kg,
  "locality": "location/city name"
}

User said: "${text}"

CRITICAL RULES FOR TYPE:
- MUST use exact capitalization: "Vegetable" NOT "vegetable"
- Valid types ONLY: Vegetable, Fruit, Grain, Leafy Greens, Pulse, Spice, Dairy, Other
- Tomato, Potato, Onion → "Vegetable"
- Apple, Mango, Banana → "Fruit"
- Rice, Wheat, Corn → "Grain"
- Spinach, Lettuce, Cabbage → "Leafy Greens"
- Lentils, Chickpeas, Beans → "Pulse"
- Turmeric, Chili, Cumin → "Spice"
- Milk, Cheese, Butter → "Dairy"
- If unsure → "Other"

Other Rules:
- If quantity is not mentioned, set to 10
- If price is not mentioned, set to 50
- If locality is not mentioned, set to "Not specified"
- Return ONLY the JSON object, no additional text or explanation
`;

        // Use the JSON endpoint for structured data
        const aiResponse = await callGeminiViaServer(prompt, true);
        console.log("AI Response Text:", aiResponse);

        // Clean up the response to extract JSON
        let jsonText = aiResponse.trim();
        if (jsonText.startsWith("```json")) {
          jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonText.startsWith("```")) {
          jsonText = jsonText.replace(/```\n?/g, "");
        }

        // Remove any leading/trailing whitespace or newlines
        jsonText = jsonText.trim();
        console.log("Cleaned JSON Text:", jsonText);

        const json = JSON.parse(jsonText);

        resolve({
          success: true,
          data: json,
          transcript: text
        });
      } catch (error) {
        console.error("Error processing voice:", error);
        reject(error);
      }
    };

    r.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      reject(new Error(`Speech recognition error: ${event.error}`));
    };

    r.onend = () => {
      console.log("Speech recognition ended");
    };

    try {
      r.start();
      console.log("Speech recognition started");
    } catch (error) {
      reject(error);
    }
  });
}
