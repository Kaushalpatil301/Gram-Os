// Static worker/villager page data — extracted from the monolithic page.jsx
// to match the data-file pattern used by farmer (lib/data.js) and retailer (lib/data.js)

// ── Navigation items ──
export const navItems = [
  { id: "profile",  label: "Profile",  icon: "User"       },
  { id: "alert",    label: "Alert",    icon: "AlertTriangle" },
  { id: "jobs",     label: "Jobs",     icon: "Briefcase"  },
  { id: "academy",  label: "Academy",  icon: "BookOpen"   },
  { id: "nptel",    label: "NPTEL",    icon: "GraduationCap" },
  { id: "earnings", label: "Earnings", icon: "IndianRupee" },
  { id: "scanner",  label: "Scanner",  icon: "QrCode"     },
  { id: "schemes",  label: "Schemes",  icon: "FileText"   },
];

// ── Default worker profile ──
export const DEFAULT_PROFILE = {
  id: "w001",
  name: "Sunita Pawar",
  location: "Satara, Maharashtra",
  verified: true,
  gigScore: 87,
  gigsCompleted: 126,
  seasonEarnings: 72000,
  badges: [
    { id: "harvest",    title: "Harvest Pro",       earnedDate: "2025-01-12" },
    { id: "pesticide",  title: "Safe Pesticide Use", earnedDate: "2025-02-03" },
    { id: "irrigation", title: "Irrigation Basics",  earnedDate: "2025-02-20" },
  ],
  language: "marathi",
  creditScore: 718,
  loanEligible: true,
};

// ── Jobs raw data ──
export const RAW_JOBS = [
  { id: "j1", cropType: "Onion Harvest",     farmerName: "Patil Farms",     location: "Phaltan",   distanceKm: 3.2,  payPerDay: 550, durationDays: 4, spotsLeft: 6, requiredBadges: ["harvest","irrigation"], expiresIn: "6h"  },
  { id: "j2", cropType: "Drip Line Setup",   farmerName: "Deshmukh Agro",   location: "Lonand",    distanceKm: 9.5,  payPerDay: 650, durationDays: 2, spotsLeft: 3, requiredBadges: ["irrigation"],           expiresIn: "22h" },
  { id: "j3", cropType: "Spraying Assist",   farmerName: "Kadam Farm",      location: "Dahiwadi",  distanceKm: 14.1, payPerDay: 600, durationDays: 1, spotsLeft: 2, requiredBadges: ["pesticide"],            expiresIn: "3h"  },
  { id: "j4", cropType: "Grape Harvest",     farmerName: "Jadhav Vineyard", location: "Dindori",   distanceKm: 7.3,  payPerDay: 700, durationDays: 5, spotsLeft: 4, requiredBadges: ["harvest"],              expiresIn: "14h" },
  { id: "j5", cropType: "Post-harvest Sort", farmerName: "Shinde Farms",    location: "Rahuri",    distanceKm: 21.0, payPerDay: 480, durationDays: 3, spotsLeft: 8, requiredBadges: [],                       expiresIn: "36h" },
];

// ── Internal skill modules ──
export const INTERNAL_MODULES = [
  { id: "m1", title: "Advanced Harvest Techniques", progressPercent: 60,  estimatedMinutes: 40, unlocksJobTier: "Tier 2 jobs (₹650/day+)",        badgeEarned: false },
  { id: "m2", title: "Safe Pesticide Handling",     progressPercent: 100, estimatedMinutes: 25, unlocksJobTier: "Certified Sprayer (₹700/day+)",   badgeEarned: true  },
  { id: "m3", title: "Irrigation Setup Basics",     progressPercent: 35,  estimatedMinutes: 30, unlocksJobTier: "Irrigation Assistant",            badgeEarned: false },
  { id: "m4", title: "Post-Harvest Quality Check",  progressPercent: 0,   estimatedMinutes: 20, unlocksJobTier: "QC Verified Worker (₹720/day+)", badgeEarned: false },
];

// ── NPTEL courses ──
export const NPTEL_COURSES = [
  { id: "n1", title: "Integrated Farming System",                     institute: "IIT Kharagpur",  duration: "8 weeks",  level: "Beginner",     relevance: "Harvest & crop handling",  url: "https://onlinecourses.nptel.ac.in/noc25_ag14/preview", rating: 4.6 },
  { id: "n2", title: "Agro-chemicals and Soil Health",                institute: "IIT Roorkee",    duration: "4 weeks",  level: "Intermediate", relevance: "Pesticide safety",         url: "https://nptel.ac.in/courses/127107010",                rating: 4.4 },
  { id: "n3", title: "Drip & Sprinkler Irrigation",                   institute: "IIT Kharagpur",  duration: "12 weeks", level: "Beginner",     relevance: "Irrigation setup jobs",    url: "https://onlinecourses.nptel.ac.in/noc25_ag25/preview", rating: 4.7 },
  { id: "n4", title: "Post Harvest Management of Horticultural Crops", institute: "IIT Kharagpur",  duration: "12 weeks", level: "Beginner",     relevance: "Post-harvest sorting gigs", url: "https://onlinecourses.nptel.ac.in/noc25_ag23/preview", rating: 4.5 },
  { id: "n5", title: "Rural Livelihood & Microfinance",               institute: "IIM Ahmedabad",  duration: "4 weeks",  level: "Beginner",     relevance: "Credit score & loans",     url: "https://nptel.ac.in/courses/110101153",                rating: 4.3 },
  { id: "n6", title: "Agriculture & Food Business",                   institute: "IIM Bangalore",  duration: "8 weeks",  level: "Intermediate", relevance: "Market awareness",         url: "https://swayam.gov.in/explorer?ncCode=IIMB",          rating: 4.5 },
];

// ── Monthly earnings ──
export const MONTHLY_EARNINGS = [
  { month: "Jan", amount: 8400  },
  { month: "Feb", amount: 11200 },
  { month: "Mar", amount: 14600 },
  { month: "Apr", amount: 9800  },
  { month: "May", amount: 13500 },
  { month: "Jun", amount: 14500 },
];

// ── Government scheme translations ──
export const SCHEME_TEXTS = {
  english: {
    title: "Government Scheme Discovery",
    apply: "Apply Now",
    docsNeeded: "Documents Required",
    schemes: [
      { id: "s1", name: "PM Kisan Samman Nidhi",   docs: ["Aadhaar Card", "Bank Passbook", "Land Records (if any)"] },
      { id: "s2", name: "Rural Livelihood Mission", docs: ["Aadhaar Card", "Residence Proof", "2 Passport Photos"]   },
      { id: "s3", name: "PMFBY Crop Insurance",     docs: ["Aadhaar Card", "Kisan Credit Card", "Bank Passbook"]     },
      { id: "s4", name: "Kisan Credit Card (KCC)",  docs: ["Aadhaar Card", "Land Records", "Income Proof"]           },
    ],
  },
  hindi: {
    title: "सरकारी योजना खोज",
    apply: "अभी आवेदन करें",
    docsNeeded: "आवश्यक दस्तावेज़",
    schemes: [
      { id: "s1", name: "प्रधानमंत्री किसान सम्मान निधि", docs: ["आधार कार्ड", "बैंक पासबुक", "भूमि रिकॉर्ड (यदि हो)"] },
      { id: "s2", name: "ग्रामीण आजीविका मिशन",           docs: ["आधार कार्ड", "निवास प्रमाण", "2 पासपोर्ट फोटो"]      },
      { id: "s3", name: "पीएमएफबीवाई फसल बीमा",           docs: ["आधार कार्ड", "किसान क्रेडिट कार्ड", "बैंक पासबुक"]   },
      { id: "s4", name: "किसान क्रेडिट कार्ड",            docs: ["आधार कार्ड", "भूमि रिकॉर्ड", "आय प्रमाण"]             },
    ],
  },
  marathi: {
    title: "शासकीय योजना शोध",
    apply: "आता अर्ज करा",
    docsNeeded: "आवश्यक कागदपत्रे",
    schemes: [
      { id: "s1", name: "पीएम किसान सन्मान निधी",    docs: ["आधार कार्ड", "बँक पासबुक", "जमिनीचे दाखले (असल्यास)"] },
      { id: "s2", name: "ग्रामीण आजीविका मिशन",      docs: ["आधार कार्ड", "निवास प्रमाणपत्र", "2 पासपोर्ट फोटो"]   },
      { id: "s3", name: "पीएमएफबीवाय पीक विमा",      docs: ["आधार कार्ड", "किसान क्रेडिट कार्ड", "बँक पासबुक"]     },
      { id: "s4", name: "किसान क्रेडिट कार्ड (KCC)", docs: ["आधार कार्ड", "जमिनीचे दाखले", "उत्पन्न प्रमाणपत्र"]  },
    ],
  },
};

// ── Language map ──
export const LANG_MAP = { en: "english", hi: "hindi", mr: "marathi" };

// ── Pure helpers ──
export function computeMatch(badges, requiredBadges) {
  const ids = new Set(badges.map((b) => b.id));
  const total = requiredBadges.length || 1;
  const matched = requiredBadges.filter((r) => ids.has(r)).length;
  return Math.round((matched / total) * 100);
}

export function toHours(s) {
  if (typeof s === "number") return s;
  const m = /(\d+)\s*h/i.exec(s ?? "");
  return m ? parseInt(m[1], 10) : 999;
}

export function fmtMoney(v) {
  return `₹${Number(v).toLocaleString("en-IN")}`;
}
