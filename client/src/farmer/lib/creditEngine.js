// GramOS — Rural Credit Scoring Engine
// Computes a 0-900 credit score from farmer's platform activity

const WEIGHTS = {
  transactionHistory: 0.25,
  paymentReliability: 0.20,
  cropQualityRatings: 0.15,
  platformTenure: 0.15,
  consistentActivity: 0.15,
  diversification: 0.10,
};

export function calculateCreditScore(farmer) {
  const scores = {};

  const deliveries = farmer.platformStats?.totalTransactions || 0;
  scores.transactionHistory = Math.min(100, deliveries * 5);

  const onTime = farmer.platformStats?.onTimePayments || 0;
  const total = farmer.platformStats?.totalPayments || 1;
  scores.paymentReliability = (onTime / total) * 100;

  const avgRating = farmer.platformStats?.avgQualityRating || 3;
  scores.cropQualityRatings = (avgRating / 5) * 100;

  const memberSince = farmer.platformStats?.memberSince || new Date().toISOString();
  const months = Math.max(1, Math.floor((Date.now() - new Date(memberSince).getTime()) / (30 * 24 * 60 * 60 * 1000)));
  scores.platformTenure = Math.min(100, months * 4);

  const activeMonths = farmer.platformStats?.activeMonths || 1;
  scores.consistentActivity = Math.min(100, (activeMonths / Math.max(1, months)) * 100);

  const cropCount = farmer.farmInfo?.primaryCrops?.length || 1;
  scores.diversification = Math.min(100, cropCount * 20);

  let totalScore = 0;
  const factors = [];

  for (const [key, weight] of Object.entries(WEIGHTS)) {
    const contribution = (scores[key] || 0) * weight * 9;
    totalScore += contribution;
    factors.push({
      name: formatFactorName(key),
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

function formatFactorName(key) {
  const names = {
    transactionHistory: "Transaction History",
    paymentReliability: "Payment Reliability",
    cropQualityRatings: "Crop Quality Ratings",
    platformTenure: "Platform Tenure",
    consistentActivity: "Consistent Activity",
    diversification: "Crop Diversification",
  };
  return names[key] || key;
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

