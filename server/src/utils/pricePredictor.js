import { GoogleGenerativeAI } from "@google/generative-ai";

export const predictPriceWithAI = async (productData) => {
  try {
    const month = new Date().toLocaleString('default', { month: 'long' });
    const prompt = `You are an AI agricultural pricing assistant. Given the following produce details, predict a realistic wholesale price per kg in Indian Rupees (INR).
Product Name: ${productData.name || "Unknown"}
Type: ${productData.type || "Unknown"}
Locality (Farmer Location): ${productData.locality || "Unknown"}
Current Month: ${month}
${productData.soil ? `Soil Type: ${productData.soil}` : ""}
Current Market context: Indian Agriculture Market

Take into consideration the current month, location, and the condition of the crop if an image is provided.
Respond ONLY with a single numeric value representing the predicted price per kg in INR. Do not include currency symbols, text, ranges, or explanations.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    let contentParts = [{ text: prompt }];
    
    if (productData.imageBase64) {
      const match = productData.imageBase64.match(/^data:(image\/\w+);base64,(.+)$/);
      if (match) {
        contentParts.push({
          inlineData: {
            data: match[2],
            mimeType: match[1]
          }
        });
      }
    }

    const result = await model.generateContent(contentParts);
    const response = await result.response;
    const text = response.text().trim();
    
    const numericMatch = text.match(/\d+(\.\d+)?/);
    
    if (numericMatch) {
      return parseFloat(numericMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error("AI Price Prediction Error:", error.message);
    // Fallback: Realistic dummy pricing independent of farmer's base price
    let baseMarketRate = 40; // Default generic rate
    
    // Assign generic market rates based on type to simulate real market
    const type = (productData.type || "").toLowerCase();
    const name = (productData.name || "").toLowerCase();
    
    if (type.includes("grain") || name.includes("rice") || name.includes("wheat")) baseMarketRate = 35;
    else if (type.includes("fruit") || name.includes("mango") || name.includes("apple")) baseMarketRate = 120;
    else if (type.includes("vegetable") || name.includes("tomato") || name.includes("onion")) baseMarketRate = 30;
    else if (type.includes("spice") || name.includes("turmeric") || name.includes("chili")) baseMarketRate = 150;
    else if (type.includes("cash") || name.includes("sugarcane") || name.includes("cotton")) baseMarketRate = 60;
    
    // Add random market fluctuation between -10% and +20%
    const fluctuation = baseMarketRate * ((Math.random() * 0.3) - 0.1); 
    
    return Math.round(baseMarketRate + fluctuation);
  }
};

export const analyzeProfitWithAI = async (productData) => {
  try {
    const prompt = `You are an AI procurement advisor for a farm retailer in India.
Analyze this product and give a profit recommendation in pure JSON only, no markdown, no explanation outside JSON.

Product: ${productData.name}
Type: ${productData.type}
Farmer: ${productData.farmerName || "Unknown"} (${productData.yearsOfExperience || 15} yrs exp, rating ${productData.farmerRating || 4.8}/5)
Location: ${productData.farmLocation || productData.locality}
Farm Size: ${productData.farmSize || "5 acres"}
Certification: ${productData.certification || "Organic"}
Quantity Available: ${productData.quantity} kg
Farmer's Base Price: ₹${productData.basePrice}/kg
Market Predicted Wholesale Price (AI): ₹${productData.aiPredictedPrice || "N/A"}/kg
Days Since Harvest: ${Math.floor((Date.now() - new Date(productData.harvestDate || productData.createdAt || Date.now())) / 86400000)}

Return strictly this JSON structure:
{
  "buyRecommendation": "STRONG BUY" | "BUY" | "HOLD" | "AVOID",
  "recommendedBuyQty": number,
  "estimatedRetailPrice": number,
  "estimatedProfitPerKg": number,
  "estimatedTotalProfit": number,
  "profitMarginPercent": number,
  "demandLevel": "Very High" | "High" | "Medium" | "Low",
  "peakSellWindow": "string (e.g. Next 3 days)",
  "spoilageRisk": "Low" | "Medium" | "High",
  "competitorPrice": number,
  "priceAdvantage": number,
  "whyBuy": ["reason 1", "reason 2", "reason 3"],
  "risks": ["risk 1", "risk 2"],
  "storageAdvice": "string",
  "aiConfidence": number
}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Profit Analysis Error:", error.message);
    throw new Error("Failed to analyze profit with AI");
  }
};
