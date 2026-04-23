const GEMINI_API_KEY = "AIzaSyC9Ca4JQEJNW5fPQueqn9gTt5d1nSNurbk";

// Function to get available models
async function getAvailableModels() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );
    
    if (response.ok) {
      const data = await response.json();
      const generateModels = data.models?.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      ).map(m => m.name);
      
      console.log("Available models with generateContent:", generateModels);
      return generateModels || [];
    }
  } catch (error) {
    console.error("Failed to fetch available models:", error);
  }
  return [];
}

// Try multiple models as fallback
const GEMINI_MODELS = [
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=",
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=",
  "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=",
];

async function callGeminiAPI(prompt) {
  let lastError = null;
  
  // First, try to get available models
  const availableModels = await getAvailableModels();
  
  // If we found available models, try them first
  if (availableModels.length > 0) {
    for (const modelName of availableModels) {
      // Extract just the model name (e.g., "models/gemini-1.5-flash" -> "gemini-1.5-flash")
      const shortName = modelName.replace('models/', '');
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
      
      try {
        console.log("Trying available model:", shortName);
        
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (res.ok) {
          console.log("✅ Model worked:", shortName);
          return await res.json();
        } else {
          console.log("❌ Model failed:", shortName, "Status:", res.status);
          lastError = await res.json().catch(() => ({ error: { message: `Status ${res.status}` } }));
        }
      } catch (error) {
        console.log("❌ Model error:", shortName, error.message);
        lastError = error;
      }
    }
  }
  
  // Fallback: Try predefined models
  console.log("Trying fallback models...");
  
  // Try each model until one works
  for (const modelUrl of GEMINI_MODELS) {
    const url = modelUrl + GEMINI_API_KEY;
    try {
      console.log("Trying model:", modelUrl.split("/models/")[1].split(":")[0]);
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (res.ok) {
        console.log("✅ Model worked!");
        return await res.json();
      } else {
        console.log("❌ Model failed with status:", res.status);
        lastError = await res.json().catch(() => ({ error: { message: `Status ${res.status}` } }));
      }
    } catch (error) {
      console.log("❌ Model error:", error.message);
      lastError = error;
    }
  }
  
  // If all models failed, throw error
  throw new Error(lastError?.error?.message || "All models failed. Please check your API key.");
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

        // Use the new helper function that tries multiple models
        const responseData = await callGeminiAPI(prompt);
        console.log("API Response:", responseData);
        
        // Check if response has the expected structure
        if (!responseData.candidates || !responseData.candidates[0] || 
            !responseData.candidates[0].content || 
            !responseData.candidates[0].content.parts || 
            !responseData.candidates[0].content.parts[0]) {
          console.error("Unexpected API response structure:", responseData);
          throw new Error("Invalid response from AI");
        }
        
        const aiResponse = responseData.candidates[0].content.parts[0].text;
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
