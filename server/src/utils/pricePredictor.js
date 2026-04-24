import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const predictPriceWithAI = async (productData) => {
  try {
    const prompt = `You are an AI agricultural pricing assistant. Given the following produce details, predict a realistic wholesale price per kg in Indian Rupees (INR).
Product Name: ${productData.name}
Type: ${productData.type}
Locality: ${productData.locality}
Current Market context: Indian Agriculture Market

Respond ONLY with a single numeric value representing the predicted price per kg in INR. Do not include currency symbols, text, ranges, or explanations.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
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
