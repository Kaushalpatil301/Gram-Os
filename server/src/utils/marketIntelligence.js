import { GoogleGenerativeAI } from "@google/generative-ai";

export const getMarketIntelligence = async (locality, soil, selectedProduce) => {
  try {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const prompt = `Act as an expert Indian agricultural market analyst and third-party data provider.
The farmer is located in or near: ${locality || "India"}.
Their soil type is: ${soil || "Unknown"}.
Current Month: ${month}.
The currently selected crop to view is: ${selectedProduce || "tomatoes"}.

Analyze the current Indian agricultural market and provide a detailed JSON response. DO NOT include markdown formatting like \`\`\`json. Return pure JSON.
The JSON must strictly follow this structure:

{
  "suitedCrops": [
    { "value": "crop_id", "label": "Crop Name", "icon": "🍅" } // Give 4-5 crops suited for this location/soil and currently trending
  ],
  "priceData": [
    {
      "id": 1, "city": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777,
      "prices": {
         // Include pricing for the 'selectedProduce' and the 'suitedCrops'.
        "crop_id": { "farmer": 25, "wholesale": 35, "retail": 45, "trend": "up|down|stable", "weekChange": 8 }
      }
    }
    // Include 6-8 major cities across India
  ],
  "insight": {
    "summary": "One short paragraph summarizing the market location-wise and overall market for the selected crop or suited crops, focusing on future profit.",
    "signal": "sell_now", // or "hold" or "neutral"
    "signals": [
      { "icon": "🌧️", "label": "Weather Impact", "value": "Brief reason", "type": "warning|positive|neutral" }
      // 3-5 signals
    ],
    "bestCity": "City Name",
    "worstCity": "City Name",
    "recommendation": "Short recommendation text",
    "priceOutlook": "📈 Rising for 1–2 weeks"
  }
}

Ensure the data is highly realistic, simulating a real third-party market data service. Include realistic prices in INR, realistic coordinates for Indian cities. Make the 'insight.summary' extremely specific to the locality, soil, and market future profits.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Market Intelligence Error:", error.message);
    // Fallback dynamic generator to avoid hardcoded UI issues
    const generateDynamicFallback = () => {
      const cropId = selectedProduce || "tomatoes";
      const baseVal = cropId.length * 5;
      
      return {
        suitedCrops: [
          { value: cropId, label: cropId.charAt(0).toUpperCase() + cropId.slice(1), icon: "🌾" },
          { value: "onions", label: "Onions", icon: "🧅" },
          { value: "potatoes", label: "Potatoes", icon: "🥔" }
        ],
        priceData: [
          {
            id: 1, city: locality || "Local Market", state: "Local", lat: 19.0760, lng: 72.8777,
            prices: {
              [cropId]: { farmer: baseVal, wholesale: baseVal + 10, retail: baseVal + 25, trend: "up", weekChange: 4 },
              "onions": { farmer: 20, wholesale: 28, retail: 40, trend: "down", weekChange: -2 }
            }
          },
          {
            id: 2, city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777,
            prices: {
              [cropId]: { farmer: baseVal + 5, wholesale: baseVal + 15, retail: baseVal + 35, trend: "up", weekChange: 6 },
              "onions": { farmer: 22, wholesale: 30, retail: 45, trend: "stable", weekChange: 0 }
            }
          },
          {
            id: 3, city: "Delhi", state: "Delhi", lat: 28.7041, lng: 77.1025,
            prices: {
              [cropId]: { farmer: baseVal - 2, wholesale: baseVal + 8, retail: baseVal + 20, trend: "down", weekChange: -5 },
              "onions": { farmer: 18, wholesale: 25, retail: 35, trend: "down", weekChange: -4 }
            }
          }
        ],
        insight: {
          summary: `Market conditions in ${locality || "your area"} for ${cropId} are showing dynamic trends. With ${soil || "your current"} soil conditions, yield expectations are average, pushing retail prices slightly up in metro cities like Mumbai.`,
          signal: "sell_now",
          signals: [
            { icon: "🌧️", label: "Local Weather", value: "Favorable for harvest", type: "positive" },
            { icon: "📈", label: "Metro Demand", value: "High demand in Mumbai", type: "positive" }
          ],
          bestCity: "Mumbai",
          worstCity: "Delhi",
          recommendation: `Transport ${cropId} to Mumbai for maximum margin. Local sales in ${locality} will yield average returns.`,
          priceOutlook: "📈 Rising for 1–2 weeks"
        }
      };
    };
    
    return generateDynamicFallback();
  }
};
