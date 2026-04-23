// GramOS — Government Scheme Discovery Engine

const SCHEMES = {
  farmer: [
    {
      id: "pm-kisan", name: "PM-Kisan Samman Nidhi", ministry: "Ministry of Agriculture",
      benefit: "₹6,000/year",
      description: "Direct income support to all landholding farmer families across India.",
      eligibility: (p) => (p?.landSizeAcres || 0) > 0,
      docs: ["Aadhaar Card", "Land Records", "Bank Passbook"],
      steps: ["Visit nearest CSC or pm-kisan.gov.in", "Submit Aadhaar and bank details", "Verify land ownership documents", "Wait for approval (7-15 days)"],
      icon: "🏛️",
    },
    {
      id: "pmfby", name: "PMFBY Crop Insurance", ministry: "Ministry of Agriculture",
      benefit: "Up to ₹2,00,000 crop loss coverage",
      description: "Affordable crop insurance against natural calamities, pests, and diseases.",
      eligibility: (p) => p?.primaryCrops?.length > 0,
      docs: ["Aadhaar Card", "Land Records", "Sowing Certificate", "Bank Account"],
      steps: ["Apply through bank branch or CSC", "Pay premium (1.5-5% of sum insured)", "Submit crop sowing details", "Claim within 72 hours of crop loss"],
      icon: "🌾",
    },
    {
      id: "kcc", name: "Kisan Credit Card (KCC)", ministry: "Dept. of Financial Services",
      benefit: "Credit up to ₹3,00,000 at 4% interest",
      description: "Short-term credit for cultivation, post-harvest, and consumption needs at subsidized interest.",
      eligibility: (p) => (p?.landSizeAcres || 0) >= 1,
      docs: ["Aadhaar Card", "Land Records", "Passport Photo", "Application Form"],
      steps: ["Visit nearest bank branch", "Fill KCC application form", "Submit land and ID documents", "Bank verifies and issues card (14 days)"],
      icon: "💳",
    },
    {
      id: "pmksy", name: "PM Krishi Sinchai Yojana", ministry: "Ministry of Agriculture",
      benefit: "55-90% subsidy on micro-irrigation",
      description: "Subsidized drip and sprinkler irrigation systems to improve water use efficiency.",
      eligibility: (p) => (p?.landSizeAcres || 0) >= 0.5,
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
    }
  ],
  retailer: [
    {
      id: "mudra", name: "PMMY - Mudra Yojana", ministry: "Ministry of Finance",
      benefit: "Up to ₹10,00,000 business loan",
      description: "Collateral-free loans for non-corporate, non-farm small/micro enterprises.",
      eligibility: (p) => (p?.businessType && p.businessType !== ""),
      docs: ["Aadhaar Card", "PAN Card", "Business Registration", "Bank Statement"],
      steps: ["Visit local bank branch", "Submit Mudra loan application", "Provide business plan/proof", "Loan disbursed to account"],
      icon: "🏦",
    },
    {
      id: "standup-india", name: "Stand-Up India", ministry: "Ministry of Finance",
      benefit: "₹10 Lakh to ₹1 Crore loan",
      description: "Bank loans for setting up a greenfield enterprise (SC/ST or Woman entrepreneur).",
      eligibility: (p) => true, // Real logic would check gender/caste
      docs: ["Aadhaar Card", "Caste Certificate", "Project Report", "PAN Card"],
      steps: ["Apply via Stand-Up India portal", "Select preferred bank", "Submit project report", "Approval within 3-4 weeks"],
      icon: "🚀",
    },
    {
      id: "msme-udyam", name: "Udyam Registration", ministry: "Ministry of MSME",
      benefit: "Subsidies, ISO charges reimbursement",
      description: "Official registration for MSMEs enabling various government subsidies and priority sector lending.",
      eligibility: () => true,
      docs: ["Aadhaar Card", "PAN Card", "GST Number (Optional)"],
      steps: ["Visit udyamregistration.gov.in", "Enter Aadhaar number", "Fill enterprise details", "Receive certificate online instantly"],
      icon: "📜",
    }
  ],
  villager: [
    {
      id: "mgnrega", name: "MGNREGA", ministry: "Ministry of Rural Development",
      benefit: "100 days of guaranteed wage employment",
      description: "Enhances livelihood security in rural areas by providing guaranteed wage employment.",
      eligibility: () => true,
      docs: ["Aadhaar Card", "Job Card", "Bank Passbook"],
      steps: ["Register at Gram Panchayat", "Apply for work", "Receive Job Card", "Wages credited directly to bank account within 15 days"],
      icon: "👷",
    },
    {
      id: "pm-awas", name: "PMAY-G (Housing for All)", ministry: "Ministry of Rural Development",
      benefit: "Financial assistance for house construction",
      description: "Assistance provided to rural poor to construct a pucca house with basic amenities.",
      eligibility: (p) => (p?.creditScore || 0) < 700, // Just a rough proxy for needing assistance
      docs: ["Aadhaar Card", "Job Card", "SBM Number", "Bank Account Details"],
      steps: ["Gram Sabha identifies beneficiaries", "Verify SEC data", "Geotag site", "Funds released in installments"],
      icon: "🏠",
    },
    {
      id: "skill-india", name: "PMKVY - Skill India", ministry: "Ministry of Skill Development",
      benefit: "Free skill training and certification",
      description: "Enables rural youth to take up industry-relevant skill training to secure a better livelihood.",
      eligibility: (p) => true,
      docs: ["Aadhaar Card", "Educational Certificates", "Bank Details"],
      steps: ["Find nearest PMKVY training center", "Enroll for a course", "Complete training & assessment", "Receive certificate and placement assistance"],
      icon: "🎓",
    }
  ],
  consumer: []
};

export function matchSchemes(role, profile) {
  const roleSchemes = SCHEMES[role] || [];
  return roleSchemes.map((scheme) => ({
    ...scheme,
    isEligible: scheme.eligibility(profile),
    eligibility: undefined,
  }));
}

export function getEligibleSchemes(role, profile) {
  return matchSchemes(role, profile).filter((s) => s.isEligible);
}

export function getEstimatedBenefits(role, profile) {
  const eligible = getEligibleSchemes(role, profile);
  let totalEstimate = 0;
  eligible.forEach((s) => {
    // Farmer
    if (s.id === "pm-kisan") totalEstimate += 6000;
    if (s.id === "kcc") totalEstimate += 300000;
    if (s.id === "pmfby") totalEstimate += 200000;
    if (s.id === "pmksy") totalEstimate += 50000;
    
    // Retailer
    if (s.id === "mudra") totalEstimate += 500000;
    if (s.id === "standup-india") totalEstimate += 1000000;
    if (s.id === "msme-udyam") totalEstimate += 15000;
    
    // Villager
    if (s.id === "mgnrega") totalEstimate += 25000;
    if (s.id === "pm-awas") totalEstimate += 120000;
    if (s.id === "skill-india") totalEstimate += 8000;
  });
  return { count: eligible.length, totalEstimate };
}
