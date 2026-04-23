import express from "express";
import bodyParser from "body-parser";
import dialogflow from "@google-cloud/dialogflow";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import cors from "cors";
import path from "path";
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors()); // Add this line
// 🔹 Dialogflow setup
const projectId = "idkok-9a8d7";
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: "./keys/agrichainbot.json",
});

// 🔹 Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "your-gemini-api-key-here");

// Check if API key is available
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
  console.warn('⚠️  GEMINI_API_KEY not set or is default. Gemini features will be disabled.');
}

// 🔹 Product synonyms mapping (multilingual)
const PRODUCT_SYNONYMS = {
  'tomato': ['tomato', 'tomatoes', 'tamatar', 'टमाटर', 'தக்காளி', 'টমেটো'],
  'sugarcane': ['sugarcane', 'sugracane', 'ganna', 'sugar cane', 'गन्ना', 'கரும்பு', 'আখ'],
  'rice': ['rice', 'basmati rice', 'chawal', 'चावल', 'அரிசி', 'ভাত'],
  'turmeric': ['turmeric', 'haldi', 'हल्दी', 'மஞ்சள்', 'হলুদ'],
  'banana': ['banana', 'kela', 'केला', 'வாழை', 'কলা'],
  'coconut': ['coconut', 'nariyal', 'नारियल', 'தேங்காய்', 'নারকেল'],
  'green gram': ['green gram', 'moong', 'mung bean', 'मूंग', 'பச்சைப் பயிறு', 'মুগ ডাল'],
  'mango': ['mango', 'aam', 'आम', 'மாங்காய்', 'আম'],
  'cotton': ['cotton', 'kapas', 'कपास', 'பருத்தி', 'তুলা'],
  'onion': ['onion', 'pyaz', 'प्याज', 'வெங்காயம்', 'পেঁয়াজ'],
  'chilli': ['chilli', 'red chilli', 'mirchi', 'मिर्च', 'மிளகாய்', 'লঙ্কা'],
  'wheat': ['wheat', 'gehun', 'गेहूं', 'கோதுமை', 'গম'],
};

// 🔹 Quality grade normalization
const QUALITY_GRADES = {
  'premium': ['premium', 'premiu', 'prem', 'best', 'high', 'उत्तम', 'சிறந்த', 'প্রিমিয়াম'],
  'grade a': ['grade a', 'a grade', 'a', 'grade-a', 'excellent', 'ग्रेड ए', 'தரம் ஏ', 'গ্রেড এ'],
  'grade b': ['grade b', 'b grade', 'b', 'grade-b', 'good', 'ग्रेड बी', 'தரம் பி', 'গ্রেড বি'],
  'grade c': ['grade c', 'c grade', 'c', 'grade-c', 'average', 'ग्रेड सी', 'தரம் சி', 'গ্রেড সি'],
};

// 🔹 Language mapping for better translation
const LANGUAGE_MAPPING = {
  'hindi': 'Hindi',
  'bengali': 'Bengali',
  'punjabi': 'Punjabi',
  'tamil': 'Tamil',
  'telugu': 'Telugu',
  'kannada': 'Kannada',
  'malayalam': 'Malayalam',
  'english': 'English'
};

// 🔹 Load and preprocess produce data
const __dirname = path.resolve();
let produceDataPath;

const possiblePaths = [
  path.join(__dirname, "data", "produce.json"),
  path.join(__dirname, "produce.json"),
  path.join(__dirname, "backend", "produce.json"),
  path.join(process.cwd(), "data", "produce.json"),
  path.join(process.cwd(), "produce.json")
];

let produceData = [];
let normalizedProduceData = [];

function preprocessProduceData(data) {
  return data.map(item => {
    const origin = item.origin || '';
    
    // Extract state from origin (handle both "State" and "City, State" formats)
    let state = origin;
    if (origin.includes(',')) {
      state = origin.split(',').pop().trim();
    }
    
    // Normalize quality grade
    let normalizedGrade = (item.quality_grade || '').toLowerCase().trim();
    for (const [standardGrade, variations] of Object.entries(QUALITY_GRADES)) {
      if (variations.includes(normalizedGrade)) {
        normalizedGrade = standardGrade;
        break;
      }
    }

    return {
      ...item,
      origin_normalized: origin.toLowerCase(),
      state_normalized: state.toLowerCase(),
      quality_grade_normalized: normalizedGrade,
      product_normalized: (item.product || '').toLowerCase()
    };
  });
}

for (const possiblePath of possiblePaths) {
  if (fs.existsSync(possiblePath)) {
    produceDataPath = possiblePath;
    console.log("✅ Found produce.json at:", produceDataPath);
    break;
  }
}

if (!produceDataPath) {
  console.error("❌ Could not find produce.json in any expected location:");
  possiblePaths.forEach(p => console.log("   -", p));
} else {
  try {
    const raw = fs.readFileSync(produceDataPath, "utf-8");
    produceData = JSON.parse(raw);
    normalizedProduceData = preprocessProduceData(produceData);
    
    console.log(`✅ Loaded ${produceData.length} produce records`);
    
    if (produceData.length > 0) {
      console.log("📋 First item sample:", JSON.stringify(produceData[0], null, 2));
      const uniqueProducts = [...new Set(produceData.map(item => item.product))];
      console.log("🛒 Available products:", uniqueProducts);
      const uniqueOrigins = [...new Set(produceData.map(item => item.origin))];
      console.log("🌍 Available origins:", uniqueOrigins.slice(0, 10));
      
      const qualityCounts = {};
      produceData.forEach(item => {
        const quality = item.quality_grade || "missing";
        qualityCounts[quality] = (qualityCounts[quality] || 0) + 1;
      });
      console.log("🏷️ Quality grade distribution:", qualityCounts);
    }
  } catch (err) {
    console.error("❌ Error loading produce.json:", err);
  }
}

// 🔹 Send text to Dialogflow
async function sendToDialogflow(query, sessionId) {
  const sessionPath = sessionClient.projectLocationAgentSessionPath(
    projectId,
    "global",
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en",
      },
    },
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    return response.queryResult;
  } catch (error) {
    console.error("❌ Dialogflow API error:", error);
    throw error;
  }
}

// 🔹 Helper function to debug Dialogflow parameters
function debugParameters(parameters) {
  console.log("🔍 DIALOGFLOW PARAMETERS DEBUG:");
  if (!parameters || Object.keys(parameters).length === 0) {
    console.log("   No parameters received");
    return;
  }
  
  Object.entries(parameters).forEach(([key, value]) => {
    console.log(`   ${key}:`, JSON.stringify(value));
  });
}

// 🔹 Find product by synonym
function findProductBySynonym(searchTerm) {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // First try exact match
  for (const [canonicalName, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    if (synonyms.includes(normalizedSearch)) {
      return canonicalName;
    }
  }
  
  // Then try partial match
  for (const [canonicalName, synonyms] of Object.entries(PRODUCT_SYNONYMS)) {
    for (const synonym of synonyms) {
      if (synonym.includes(normalizedSearch) || normalizedSearch.includes(synonym)) {
        return canonicalName;
      }
    }
  }
  
  return normalizedSearch; // Return original if no synonym found
}

// 🔹 Normalize quality grade
function normalizeQualityGrade(grade) {
  if (!grade) return null;
  
  const normalized = grade.toLowerCase().trim();
  for (const [standardGrade, variations] of Object.entries(QUALITY_GRADES)) {
    if (variations.includes(normalized)) {
      return standardGrade;
    }
  }
  
  // Try partial matching
  for (const [standardGrade, variations] of Object.entries(QUALITY_GRADES)) {
    for (const variation of variations) {
      if (variation.includes(normalized) || normalized.includes(variation)) {
        return standardGrade;
      }
    }
  }
  
  return normalized;
}

// 🔹 Language detection function
function detectLanguage(text) {
  // Simple language detection based on character ranges
  if (/[\u0900-\u097F]/.test(text)) return 'hindi'; // Devanagari script (Hindi, Marathi, Nepali)
  if (/[\u0980-\u09FF]/.test(text)) return 'bengali';
  if (/[\u0A00-\u0A7F]/.test(text)) return 'punjabi';
  if (/[\u0B80-\u0BFF]/.test(text)) return 'tamil';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'telugu';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam';
  return 'english';
}

// 🔹 Manual parameter extraction for when Dialogflow fails
function extractParametersManually(query) {
  const params = {
    product: null,
    origin: null,
    grade: null
  };

  // Simple keyword matching
  const words = query.toLowerCase().split(' ');
  
  // Check for products
  for (const word of words) {
    const product = findProductBySynonym(word);
    if (product && product !== word) { // Found a known product
      params.product = product;
      break;
    }
  }

  // Check for locations (simple approach)
  const locationKeywords = ['in', 'from', 'at', 'near'];
  for (let i = 0; i < words.length; i++) {
    if (locationKeywords.includes(words[i]) && i + 1 < words.length) {
      params.origin = words.slice(i + 1).join(' ');
      break;
    }
  }

  // Check for quality grades
  const gradeWords = ['premium', 'grade a', 'grade b', 'grade c', 'quality'];
  for (const grade of gradeWords) {
    if (query.toLowerCase().includes(grade)) {
      params.grade = grade;
      break;
    }
  }

  return params;
}

// 🔹 Translate query to English for Dialogflow (using Gemini)
async function translateToEnglish(query, sourceLang) {
  if (sourceLang === 'english') return query;
  
  // If Gemini is not configured, return original query
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️  Gemini translation disabled, using original query');
    return query;
  }
  
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `Translate this ${LANGUAGE_MAPPING[sourceLang] || sourceLang} text to English: "${query}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Translation error:", error);
    return query; // Fallback to original query
  }
}

// 🔹 Translate response to user's language
async function translateResponse(response, targetLang) {
  if (targetLang === 'english') return response;
  
  // If Gemini is not configured, return English response
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️  Gemini translation disabled, using English response');
    return response;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const prompt = `Translate this English text to ${LANGUAGE_MAPPING[targetLang] || targetLang} (make it natural and conversational for agricultural context): "${response}"`;
    
    const result = await model.generateContent(prompt);
    const translated = await result.response;
    return translated.text().trim();
  } catch (error) {
    console.error("Translation error:", error);
    return response; // Fallback to English
  }
}

// 🔹 Enhance response with Gemini for more natural language
async function enhanceResponse(response, userLanguage, context) {
  // If Gemini API key is not set, return original response
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
    console.log('⚠️  Gemini disabled, using original response');
    return response;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite  " });
    const prompt = `
      You are AgriChainBot, an agricultural supply chain assistant. 
      Make this response more natural, friendly and conversational in ${LANGUAGE_MAPPING[userLanguage] || userLanguage}:
      
      Original response: "${response}"
      Context: ${context}
      
      Please provide a natural, conversational response while keeping all the factual information.
      Format the response in a clean way without markdown or special characters like ** or ().
      If showing search results, present them in a table-like format with clear spacing.
    `;
    
    const result = await model.generateContent(prompt);
    const enhanced = await result.response;
    return enhanced.text().trim();
  } catch (error) {
    console.error("Enhancement error:", error);
    return response; // Fallback to original
  }
}

// 🔹 Format search results in a clean table-like format
// 🔹 Format search results in a clean table-like format
// 🔹 Format search results in a clean, parseable format
function formatSearchResults(results, userLanguage) {
  if (results.length === 0) return "";
  
  let formatted = "";
  
  // For all languages, use a simple tabular format without ASCII art
  formatted += `Found ${results.length} matching records:\n\n`;
  
  // Create a clean header row
  formatted += "No.  Product        Type        Location    Quality   Farm ID     Lot ID      Quantity\n";
  formatted += "───────────────────────────────────────────────────────────────────────────────────────\n";
  
  // Add data rows
  results.forEach((item, index) => {
    const product = (item.product || 'N/A').substring(0, 14);
    const type = (item.product_type || 'N/A').substring(0, 11);
    const location = (item.origin || 'N/A').substring(0, 11);
    const quality = (item.quality_grade || 'N/A').substring(0, 9);
    const farmId = (item.farmid || 'N/A').substring(0, 11);
    const lotId = (item.lotid || 'N/A').substring(0, 11);
    const quantity = (item.quantity || 'N/A').toString().substring(0, 8);
    
    formatted += `${(index + 1).toString().padEnd(4)} ${product.padEnd(14)} ${type.padEnd(11)} ${location.padEnd(11)} ${quality.padEnd(9)} ${farmId.padEnd(11)} ${lotId.padEnd(11)} ${quantity}\n`;
  });
  
  formatted += `\nTip: You can filter by product, location, quality grade, farm ID, or lot ID`;
  
  return formatted;
}


// 🔹 Handle custom actions
async function handleAction(result, userLanguage, userQuery, englishQuery) { 
  const intent = result.intent.displayName;
  const parameters = result.parameters?.fields || {};
  let reply = result.fulfillmentText;

  console.log(`\n🎯 Intent detected: ${intent}`);
  console.log(`💬 Dialogflow response: ${result.fulfillmentText}`);
  debugParameters(parameters);

  // Handle different intents
  if (intent.includes("Welcome") || intent.includes("welcome")) {
    reply = "Welcome to AgriChainBot! Are you a farmer or a retailer?";
  } else if (intent.includes("farmer.register.produce")) {
    reply = `Registered your produce:\n
      Product: ${parameters.product?.stringValue || "N/A"}\n
      Type: ${parameters.product_type?.stringValue || "N/A"}\n
      Quantity: ${parameters.quantity?.numberValue || "N/A"}\n
      Origin: ${parameters.origin?.stringValue || "N/A"}`;
  } else if (intent.includes("farmer.view.earnings")) {
    reply = `Fetching your earnings report...`;
  } else if (intent.includes("retailer.search.produce")) {
    // Extract parameters correctly - handle both stringValue and listValue
    const productParam = parameters.product?.stringValue?.toLowerCase() || null;
    const gradeParam = parameters.quality_grade?.stringValue?.toLowerCase() || null;
    const originParam = parameters.origin?.stringValue?.toLowerCase() || null;
    const farmParam = parameters.farmid?.stringValue?.toLowerCase() || null;
    const lotParam = parameters.lotid?.stringValue?.toLowerCase() || null;
    
    // Handle geo-state which can be listValue or stringValue
    let geoState = null;
    if (parameters['geo-state']?.listValue?.values?.[0]?.stringValue) {
      geoState = parameters['geo-state'].listValue.values[0].stringValue.toLowerCase();
    } else if (parameters['geo-state']?.stringValue) {
      geoState = parameters['geo-state'].stringValue.toLowerCase();
    }
    
    const geoCity = parameters['geo-city']?.stringValue?.toLowerCase() || null;

    // Normalize parameters
    let product = productParam ? findProductBySynonym(productParam) : null;
    let grade = gradeParam ? normalizeQualityGrade(gradeParam) : null;
    let origin = originParam || geoState || geoCity;
    const farmId = farmParam;
    const lotId = lotParam;

    // If Dialogflow didn't extract parameters properly, try manual extraction
    if (!product && !origin) {
      const manualParams = extractParametersManually(englishQuery);
      product = manualParams.product || product;
      origin = manualParams.origin || origin;
      grade = manualParams.grade || grade;
      console.log(`🔄 Using manually extracted params:`, manualParams);
    }
    
    console.log(`🔍 SEARCH PARAMS - Product: '${product}', Origin: '${origin}', Grade: '${grade}', State: '${geoState}', City: '${geoCity}', Farmid: '${farmId}', Lotid:'${lotId}'`);

    let filtered = [...normalizedProduceData];

    // Apply filters
    if (product && product.trim() !== '') {
      const beforeCount = filtered.length;
      filtered = filtered.filter((item) =>
        item.product_normalized === product.toLowerCase()
      );
      console.log(`📊 Product filter: ${beforeCount} → ${filtered.length} items (searching for: '${product}')`);
    }

    if (farmId && farmId.trim() !== '') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(item => 
        item.farmid && item.farmid.toLowerCase().includes(farmId.toLowerCase())
      );
      console.log(`🏭 Farm ID filter: ${beforeCount} → ${filtered.length} items (searching for: '${farmId}')`);
    }

    if (lotId && lotId.trim() !== '') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(item => 
        item.lotid && item.lotid.toLowerCase().includes(lotId.toLowerCase())
      );
      console.log(`📦 Lot ID filter: {{beforeCount}} → ${filtered.length} items (searching for: '${lotId}')`);
    }

    if (origin && origin.trim() !== '') {
      const beforeCount = filtered.length;
      const normalizedOrigin = origin.toLowerCase();
      filtered = filtered.filter((item) =>
        item.origin_normalized.includes(normalizedOrigin) ||
        item.state_normalized.includes(normalizedOrigin)
      );
      console.log(`📊 Location filter: ${beforeCount} → ${filtered.length} items (searching for: '${origin}')`);
    }

    if (grade && grade.trim() !== '') {
      const beforeCount = filtered.length;
      filtered = filtered.filter((item) =>
        item.quality_grade_normalized === grade
      );
      console.log(`📊 Grade filter: ${beforeCount} → ${filtered.length} items (searching for: '${grade}')`);
    }

    console.log(`📈 Final results: ${filtered.length} items after all filters`);

    if (filtered.length === 0) {
      reply = `No results found for ${product || "any product"} ${
        grade ? "of " + grade + " quality" : ""
      } ${origin ? "from " + origin : ""}.`;
      
      // Show available options
      const availableProducts = [...new Set(produceData.map(item => item.product).filter(Boolean))];
      const availableOrigins = [...new Set(produceData.map(item => item.origin).filter(Boolean))];
      const availableGrades = [...new Set(normalizedProduceData.map(item => item.quality_grade_normalized).filter(Boolean))];
      const availablefarmId = [...new Set(produceData.map(item => item.farmid).filter(Boolean))];
      const availablelotId = [...new Set(produceData.map(item => item.lotid).filter(Boolean))];
      
      if (availableProducts.length > 0) {
        reply += `\n\nAvailable products: ${availableProducts.slice(0, 6).join(", ")}${availableProducts.length > 6 ? '...' : ''}`;
      }
      if (availableOrigins.length > 0) {
        reply += `\nAvailable locations: ${availableOrigins.slice(0, 5).join(", ")}${availableOrigins.length > 5 ? '...' : ''}`;
      }
      if (availableGrades.length > 0) {
        reply += `\nAvailable grades: ${availableGrades.slice(0, 5).join(", ")}${availableGrades.length > 5 ? '...' : ''}`;
      }
      if (availablefarmId.length > 0) {
        reply += `\nAvailable farm IDs: ${availablefarmId.slice(0, 5).join(", ")}${availablefarmId.length > 5 ? '...' : ''}`;
      }
      if (availablelotId.length > 0 && availablelotId.some(id => id && id.trim() !== '')) {
        reply += `\nAvailable lot IDs: ${availablelotId.filter(id => id && id.trim() !== '').slice(0, 5).join(", ")}${availablelotId.length > 5 ? '...' : ''}`;
      }
    } else {
      // Clean, formatted results
      reply = `Found ${filtered.length} matching record${filtered.length !== 1 ? 's' : ''}:\n\n`;
      
      // Add formatted results
      reply += formatSearchResults(filtered, userLanguage);
      
      if (filtered.length > 5) {
        reply += `\n... and ${filtered.length - 5} more records`;
      }
      
      reply += `\n\nTip: You can filter by product, location, quality grade, farm ID, or lot ID`;
    }
  } else if (intent.includes("Fallback") || intent.includes("fallback")) {
    reply = "Sorry, I didn't understand that. Can you rephrase?";
  } else {
    console.log(`⚠️ Unhandled intent: ${intent}`);
    reply = result.fulfillmentText || "I'm not sure how to handle that request.";
  }

  // Enhance the response with Gemini for more natural language
  const context = `User query: ${userQuery}, Intent: ${intent}, Language: ${userLanguage}`;
  reply = await enhanceResponse(reply, userLanguage, context);

  console.log(`📤 Final response: ${reply}`);
  return reply;
}

// 🔹 API endpoint
app.post("/chat", async (req, res) => {
  try {
    const { text, sessionId } = req.body;
    
    console.log(`\n--- NEW REQUEST ---`);
    console.log(`👤 User said: "${text}"`);
    console.log(`🆔 Session ID: ${sessionId}`);

    // Step 1: Detect language
    const userLanguage = detectLanguage(text);
    console.log(`🌐 Detected language: ${userLanguage}`);

    // Step 2: Translate to English if needed
    let englishQuery = text;
    if (userLanguage !== 'english') {
      englishQuery = await translateToEnglish(text, userLanguage);
      console.log(`🔤 Translated to English: "${englishQuery}"`);
    }

    // Step 3: Send to Dialogflow
    const result = await sendToDialogflow(englishQuery, sessionId);
    console.log(`🤖 Dialogflow intent: ${result.intent.displayName}`);

    // Step 4: Process with enhanced logic
    const finalReply = await handleAction(result, userLanguage, text, englishQuery);

    // Step 5: Translate back to user's language if needed
    let translatedReply = finalReply;
    if (userLanguage !== 'english') {
      console.log(`🔄 Translating response to ${userLanguage}...`);
      translatedReply = await translateResponse(finalReply, userLanguage);
      console.log(`🌐 Translated response: "${translatedReply}"`);
    }

    // Step 6: Send response
    if (!res.headersSent) {
      res.json({
        reply: translatedReply,
        intent: result.intent.displayName,
        parameters: result.parameters?.fields || {},
        detectedLanguage: userLanguage
      });
    }
  } catch (err) {
    console.error("❌ Error in /chat endpoint:", err);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: "Something went wrong",
        details: err.message 
      });
    }
  }
});

// 🔹 Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    produceRecords: produceData.length,
    loaded: produceData.length > 0,
    dataPath: produceDataPath || "Not found",
    geminiEnabled: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here')
  });
});

// 🔹 Start server
const PORT = 5003;
app.listen(PORT, () =>
  console.log(`🚀 Hybrid multilingual server running on http://localhost:${PORT}`)
);