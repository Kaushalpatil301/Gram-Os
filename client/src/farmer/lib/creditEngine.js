import axios from "axios";

// GramOS — Rural Credit Scoring Engine
// Computes a 0-900 credit score from farmer's platform activity

export function calculateCreditScore(role, profile) {
  const scores = {};
  let factorNames = {};
  
  if (role === "retailer") {
    factorNames = {
      factor1: "Procurement Volume",
      factor2: "Contract Fulfillment",
      factor3: "Payment Timeliness",
      factor4: "Market Reputation"
    };
  } else if (role === "villager" || role === "worker") {
    factorNames = {
      factor1: "Task Completion Rate",
      factor2: "Skill Validations",
      factor3: "Punctuality",
      factor4: "Local Trust & Safety"
    };
  } else {
    factorNames = {
      factor1: "Crop Yield Consistency",
      factor2: "Land Utilization",
      factor3: "Payment Reliability",
      factor4: "Platform Tenure"
    };
  }

  // Generate dynamic scores based loosely on profile to feel real
  const baseSeed = profile?.createdAt ? profile.createdAt.length : 10;
  scores.factor1 = Math.min(100, 60 + baseSeed * 2);
  scores.factor2 = Math.min(100, 75 + (profile?.landSizeAcres || profile?.yearsInBusiness || 0) * 2);
  scores.factor3 = Math.min(100, 85 - (profile?.failures || 0) * 10);
  scores.factor4 = Math.min(100, 50 + (profile?.creditScore || 50) / 2);

  const WEIGHTS = { factor1: 0.30, factor2: 0.25, factor3: 0.25, factor4: 0.20 };
  let totalScore = 0;
  const factors = [];

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const contribution = (scores[key] || 0) * weight * 9;
    totalScore += contribution;
    factors.push({
      name: factorNames[key],
      score: Math.round(scores[key]),
      weight: Math.round(weight * 100),
      contribution: Math.round(contribution),
      status: scores[key] >= 70 ? "positive" : scores[key] >= 40 ? "neutral" : "negative",
    });
  }

  return {
    score: Math.round(Math.min(900, totalScore)),
    grade: getGrade(totalScore),
    factors: factors.sort((a, b) => b.contribution - a.contribution),
    eligible: totalScore >= 450,
    nextMilestone: getNextMilestone(totalScore),
    tips: [
      `Increase your ${factorNames.factor1} metrics`,
      `Maintain consistency in ${factorNames.factor2}`,
      "Ensure timely payments and platform activity",
      "Diversify your interactions within the GramOS network"
    ]
  };
}

function getGrade(score) {
  if (score >= 750) return { label: "Excellent", color: "#10B981" };
  if (score >= 600) return { label: "Good", color: "#3B82F6" };
  if (score >= 450) return { label: "Fair", color: "#F59E0B" };
  if (score >= 300) return { label: "Building", color: "#F97316" };
  return { label: "New", color: "#EF4444" };
}

function getNextMilestone(score) {
  const milestones = [
    { threshold: 300, label: "Micro-loan eligible" },
    { threshold: 450, label: "KCC pre-approval" },
    { threshold: 600, label: "Preferential interest rates" },
    { threshold: 750, label: "Premium credit access" },
  ];
  return milestones.find((m) => m.threshold > score) || { threshold: 900, label: "Maximum score reached" };
}



export function generateCreditHistory() {
  const history = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const baseScore = 420 + (11 - i) * 35 + Math.round(Math.random() * 30 - 15);
    history.push({
      month: date.toLocaleString("default", { month: "short" }),
      year: date.getFullYear(),
      score: Math.min(900, Math.max(100, baseScore)),
    });
  }
  return history;
}

export function getMockFarmerData() {
  return {
    personalInfo: { name: "Rajesh Sharma", phone: "+91 98765 43210", village: "Koregaon", district: "Pune", state: "Maharashtra" },
    farmInfo: { landSizeAcres: 5, soilType: "Black Cotton", irrigationType: "Drip", primaryCrops: ["Tomato", "Onion", "Wheat", "Sugarcane"] },
    bankInfo: { accountLinked: true, upiId: "rajesh@upi" },
    platformStats: {
      totalTransactions: 18,
      totalRevenue: 284000,
      memberSince: "2024-06-15T00:00:00Z",
      onTimePayments: 16,
      totalPayments: 18,
      avgQualityRating: 4.2,
      activeMonths: 20,
    },
  };
}

export function calculateExpectedLoan(farmer, creditScore) {
  // Base loan amount based on 1.5x of total revenue
  const revenue = farmer?.platformStats?.totalRevenue || 0;
  let baseAmount = revenue * 1.5;

  // Adjust amount based on credit score. E.g. score of <300 means 0 eligible amount.
  // 900 score means 100% of the base amount.
  if (creditScore < 300) return 0;
  
  const scoreMultiplier = creditScore / 900;
  return Math.round(baseAmount * scoreMultiplier);
}

// ─── AI-BASED CREDIT SCORE ENGINE ─────────────────────────────────────────────
export async function fetchAICreditScore(role, profile) {
  const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (!API_KEY) {
    console.warn("No OpenRouter API key found. Using fallback score.");
    return calculateCreditScore(role, profile); // fallback
  }

  try {
    const prompt = `
    You are GramOS AI, an intelligent brain analyzing rural stakeholder profiles to determine a Trust, Reliability, and Credit Score.
    Analyze the following profile for a ${role}:
    ${JSON.stringify(profile, null, 2)}
    
    Calculate a score between 0 and 900 based on their profile metrics.
    Generate 4 unique assessment factors highly specific to a ${role}. 
    For example, if it's a farmer, you might use "Crop Yield Consistency", "Land Utilization", "Payment Reliability", etc. If a retailer, "Procurement Volume", "Contract Fulfillment", etc. If a villager/worker, "Task Punctuality", "Skill Verifications", etc. Make the factor names and scores uniquely tailored to their actual profile data!
    
    Output ONLY valid JSON with this exact structure (no markdown tags):
    {
      "score": number (0-900),
      "grade": { "label": string (e.g. "Excellent", "Good", "Building"), "color": string (hex color code like "#10B981" or "#3B82F6" or "#F97316") },
      "eligible": boolean (true if score > 450),
      "nextMilestone": { "label": string, "threshold": number },
      "factors": [
        { "name": string (Dynamic role-specific factor 1), "score": number (0-100), "weight": number, "contribution": number, "status": "positive"|"neutral"|"negative" },
        { "name": string (Dynamic role-specific factor 2), "score": number (0-100), "weight": number, "contribution": number, "status": "positive"|"neutral"|"negative" },
        { "name": string (Dynamic role-specific factor 3), "score": number (0-100), "weight": number, "contribution": number, "status": "positive"|"neutral"|"negative" },
        { "name": string (Dynamic role-specific factor 4), "score": number (0-100), "weight": number, "contribution": number, "status": "positive"|"neutral"|"negative" }
      ],
      "tips": [ array of 4-5 string tips to improve score based on their specific profile ]
    }`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      },
      {
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "GramOS Rural Credit AI"
        }
      }
    );

    const resultText = response.data.choices[0].message.content;
    const result = JSON.parse(resultText);
    return result;
  } catch (error) {
    console.error("AI Credit Engine Error:", error);
    return calculateCreditScore(role, profile); // fallback
  }
}


