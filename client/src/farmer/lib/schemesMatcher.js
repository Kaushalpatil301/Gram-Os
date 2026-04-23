// GramOS — Government Scheme Discovery Engine

const SCHEMES = [
  {
    id: "pm-kisan", name: "PM-Kisan Samman Nidhi", ministry: "Ministry of Agriculture",
    benefit: "₹6,000/year (₹2,000 every 4 months)",
    description: "Direct income support to all landholding farmer families across India.",
    eligibility: (f) => f.farmInfo?.landSizeAcres > 0,
    docs: ["Aadhaar Card", "Land Records", "Bank Passbook"],
    steps: ["Visit nearest CSC or pm-kisan.gov.in", "Submit Aadhaar and bank details", "Verify land ownership documents", "Wait for approval (7-15 days)"],
    icon: "🏛️",
  },
  {
    id: "pmfby", name: "PMFBY Crop Insurance", ministry: "Ministry of Agriculture",
    benefit: "Up to ₹2,00,000 crop loss coverage",
    description: "Affordable crop insurance against natural calamities, pests, and diseases.",
    eligibility: (f) => f.farmInfo?.primaryCrops?.length > 0,
    docs: ["Aadhaar Card", "Land Records", "Sowing Certificate", "Bank Account"],
    steps: ["Apply through bank branch or CSC", "Pay premium (1.5-5% of sum insured)", "Submit crop sowing details", "Claim within 72 hours of crop loss"],
    icon: "🌾",
  },
  {
    id: "kcc", name: "Kisan Credit Card (KCC)", ministry: "Dept. of Financial Services",
    benefit: "Credit up to ₹3,00,000 at 4% interest",
    description: "Short-term credit for cultivation, post-harvest, and consumption needs at subsidized interest.",
    eligibility: (f) => (f.farmInfo?.landSizeAcres || 0) >= 1,
    docs: ["Aadhaar Card", "Land Records", "Passport Photo", "Application Form"],
    steps: ["Visit nearest bank branch", "Fill KCC application form", "Submit land and ID documents", "Bank verifies and issues card (14 days)"],
    icon: "💳",
  },
  {
    id: "soil-health", name: "Soil Health Card Scheme", ministry: "Ministry of Agriculture",
    benefit: "Free soil testing & nutrient recommendations",
    description: "Government labs test your soil and provide customized fertilizer recommendations.",
    eligibility: () => true,
    docs: ["Aadhaar Card", "Land Details"],
    steps: ["Contact local Krishi Vigyan Kendra", "Collect soil sample (500gm from 6-inch depth)", "Submit at testing center", "Receive Soil Health Card in 30 days"],
    icon: "🧪",
  },
  {
    id: "pmksy", name: "PM Krishi Sinchai Yojana", ministry: "Ministry of Agriculture",
    benefit: "55-90% subsidy on micro-irrigation",
    description: "Subsidized drip and sprinkler irrigation systems to improve water use efficiency.",
    eligibility: (f) => (f.farmInfo?.landSizeAcres || 0) >= 0.5,
    docs: ["Aadhaar Card", "Land Records", "Bank Account", "Caste Certificate (if SC/ST)"],
    steps: ["Apply on state agriculture portal", "Select vendor from approved list", "Get installation verification", "Subsidy credited in 30-45 days"],
    icon: "💧",
  },
  {
    id: "enam", name: "e-NAM (National Agriculture Market)", ministry: "Ministry of Agriculture",
    benefit: "Access to 1,000+ mandis for transparent bidding",
    description: "Online marketplace connecting farmers directly to buyers across India.",
    eligibility: () => true,
    docs: ["Aadhaar Card", "Bank Account", "Mobile Number"],
    steps: ["Register on enam.gov.in", "Link bank account", "List produce for auction", "Accept best bid and receive payment"],
    icon: "🏪",
  },
  {
    id: "shetkari-sanman", name: "Shetkari Sanman Yojana", ministry: "Govt. of Maharashtra",
    benefit: "₹6,000/year additional support",
    description: "Maharashtra state scheme providing additional income support on top of PM-Kisan.",
    eligibility: (f) => (f.personalInfo?.state || "").toLowerCase().includes("maharashtra"),
    docs: ["Aadhaar Card", "7/12 Extract", "8A Certificate", "Bank Passbook"],
    steps: ["Apply at Taluka Agriculture Office", "Submit 7/12 and 8A documents", "Biometric verification at CSC", "Funds transferred in 2 installments"],
    icon: "🌻",
  },
  {
    id: "nfsm", name: "National Food Security Mission", ministry: "Ministry of Agriculture",
    benefit: "Free seeds, subsidized inputs for food grains",
    description: "Support for farmers growing rice, wheat, pulses through subsidized inputs.",
    eligibility: (f) => {
      const crops = (f.farmInfo?.primaryCrops || []).map((c) => c.toLowerCase());
      return crops.some((c) => ["rice", "wheat", "dal", "bajra", "jowar", "ragi", "maize"].includes(c));
    },
    docs: ["Aadhaar Card", "Land Records", "Crop Plan"],
    steps: ["Contact District Agriculture Officer", "Submit crop plan", "Receive subsidized seed kits", "Follow recommended practices for bonus"],
    icon: "🌾",
  },
];

export function matchSchemes(farmer) {
  return SCHEMES.map((scheme) => ({
    ...scheme,
    isEligible: scheme.eligibility(farmer),
    eligibility: undefined,
  }));
}

export function getEligibleSchemes(farmer) {
  return matchSchemes(farmer).filter((s) => s.isEligible);
}

export function getEstimatedBenefits(farmer) {
  const eligible = getEligibleSchemes(farmer);
  let totalEstimate = 0;
  eligible.forEach((s) => {
    if (s.id === "pm-kisan") totalEstimate += 6000;
    if (s.id === "shetkari-sanman") totalEstimate += 6000;
    if (s.id === "kcc") totalEstimate += 300000;
    if (s.id === "pmfby") totalEstimate += 200000;
    if (s.id === "pmksy") totalEstimate += 50000;
  });
  return { count: eligible.length, totalEstimate };
}
