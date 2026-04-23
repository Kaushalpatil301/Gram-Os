import { Scheme, NptelCourse, SkillModule } from '../models/villager.models.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';

// ---- SEEDER DATA ----
const INITIAL_SCHEMES = [
  {
    schemeId: "s1",
    applicableRoles: ["farmer"],
    translations: {
      english: { name: "PM Kisan Samman Nidhi", docs: ["Aadhaar Card", "Bank Passbook", "Land Records (if any)"] },
      hindi: { name: "प्रधानमंत्री किसान सम्मान निधि", docs: ["आधार कार्ड", "बैंक पासबुक", "भूमि रिकॉर्ड (यदि हो)"] },
      marathi: { name: "पीएम किसान सन्मान निधी", docs: ["आधार कार्ड", "बँक पासबुक", "जमिनीचे दाखले (असल्यास)"] }
    }
  },
  {
    schemeId: "s2",
    applicableRoles: ["farmer", "worker", "villager"],
    translations: {
      english: { name: "Rural Livelihood Mission", docs: ["Aadhaar Card", "Residence Proof", "2 Passport Photos"] },
      hindi: { name: "ग्रामीण आजीविका मिशन", docs: ["आधार कार्ड", "निवास प्रमाण", "2 पासपोर्ट फोटो"] },
      marathi: { name: "ग्रामीण आजीविका मिशन", docs: ["आधार कार्ड", "निवास प्रमाणपत्र", "2 पासपोर्ट फोटो"] }
    }
  },
  {
    schemeId: "s3",
    applicableRoles: ["farmer"],
    translations: {
      english: { name: "PMFBY Crop Insurance", docs: ["Aadhaar Card", "Kisan Credit Card", "Bank Passbook"] },
      hindi: { name: "पीएमएफबीवाई फसल बीमा", docs: ["आधार कार्ड", "किसान क्रेडिट कार्ड", "बैंक पासबुक"] },
      marathi: { name: "पीएमएफबीवाय पीक विमा", docs: ["आधार कार्ड", "किसान क्रेडिट कार्ड", "बँक पासबुक"] }
    }
  },
  {
    schemeId: "s4",
    applicableRoles: ["farmer"],
    translations: {
      english: { name: "Kisan Credit Card (KCC)", docs: ["Aadhaar Card", "Land Records", "Income Proof"] },
      hindi: { name: "किसान क्रेडिट कार्ड", docs: ["आधार कार्ड", "भूमि रिकॉर्ड", "आय प्रमाण"] },
      marathi: { name: "किसान क्रेडिट कार्ड (KCC)", docs: ["आधार कार्ड", "जमिनीचे दाखले", "उत्पन्न प्रमाणपत्र"] }
    }
  },
  {
    schemeId: "s5",
    applicableRoles: ["worker", "villager"],
    translations: {
      english: { name: "Mahatma Gandhi NREGA", docs: ["Aadhaar Card", "Job Card", "Bank Passbook"] },
      hindi: { name: "महात्मा गांधी नरेगा", docs: ["आधार कार्ड", "जॉब कार्ड", "बैंक पासबुक"] },
      marathi: { name: "महात्मा गांधी नरेगा", docs: ["आधार कार्ड", "जॉब कार्ड", "बँक पासबुक"] }
    }
  }
];

const INITIAL_COURSES = [
  { courseId: "n1", title: "Integrated Farming System", institute: "IIT Kharagpur", duration: "8 weeks", level: "Beginner", relevance: "Harvest & crop handling", url: "https://onlinecourses.nptel.ac.in/noc25_ag14/preview", rating: 4.6 },
  { courseId: "n2", title: "Agro-chemicals and Soil Health", institute: "IIT Roorkee", duration: "4 weeks", level: "Intermediate", relevance: "Pesticide safety", url: "https://nptel.ac.in/courses/127107010", rating: 4.4 },
  { courseId: "n3", title: "Drip & Sprinkler Irrigation", institute: "IIT Kharagpur", duration: "12 weeks", level: "Beginner", relevance: "Irrigation setup jobs", url: "https://onlinecourses.nptel.ac.in/noc25_ag25/preview", rating: 4.7 },
  { courseId: "n4", title: "Post Harvest Management of Horticultural Crops", institute: "IIT Kharagpur", duration: "12 weeks", level: "Beginner", relevance: "Post-harvest sorting gigs", url: "https://onlinecourses.nptel.ac.in/noc25_ag23/preview", rating: 4.5 },
  { courseId: "n5", title: "Rural Livelihood & Microfinance", institute: "IIM Ahmedabad", duration: "4 weeks", level: "Beginner", relevance: "Credit score & loans", url: "https://nptel.ac.in/courses/110101153", rating: 4.3 },
  { courseId: "n6", title: "Agriculture & Food Business", institute: "IIM Bangalore", duration: "8 weeks", level: "Intermediate", relevance: "Market awareness", url: "https://swayam.gov.in/explorer?ncCode=IIMB", rating: 4.5 },
];

const INITIAL_MODULES = [
  { moduleId: "m1", title: "Advanced Harvest Techniques", estimatedMinutes: 40, unlocksJobTier: "Tier 2 jobs (₹650/day+)", baseProgressPercent: 60 },
  { moduleId: "m2", title: "Safe Pesticide Handling", estimatedMinutes: 25, unlocksJobTier: "Certified Sprayer (₹700/day+)", baseProgressPercent: 100 },
  { moduleId: "m3", title: "Irrigation Setup Basics", estimatedMinutes: 30, unlocksJobTier: "Irrigation Assistant", baseProgressPercent: 35 },
  { moduleId: "m4", title: "Post-Harvest Quality Check", estimatedMinutes: 20, unlocksJobTier: "QC Verified Worker (₹720/day+)", baseProgressPercent: 0 },
];

// Seed function called lazily
async function seedIfNeeded() {
  const schemeCount = await Scheme.countDocuments();
  if (schemeCount < 5) {
    if (schemeCount > 0) await Scheme.deleteMany({});
    await Scheme.insertMany(INITIAL_SCHEMES);
    console.log("Seeded Schemes with Roles");
  }
  if (await NptelCourse.countDocuments() === 0) {
    await NptelCourse.insertMany(INITIAL_COURSES);
    console.log("Seeded Courses");
  }
  if (await SkillModule.countDocuments() === 0) {
    await SkillModule.insertMany(INITIAL_MODULES);
    console.log("Seeded Modules");
  }
}

// ---- CONTROLLERS ----

export const getSchemes = async (req, res, next) => {
  try {
    await seedIfNeeded();
    
    let query = {};
    const { role } = req.query;
    if (role && role !== "all") {
      query.applicableRoles = { $in: [role.toLowerCase()] };
    }

    const schemes = await Scheme.find(query);
    // Format response to match frontend expectations
    // The frontend expects SCHEME_TEXTS[lang].schemes
    
    // We send an object that builds the dictionary for the frontend
    const schemeDict = {
      english: { title: "Government Scheme Discovery", apply: "Apply Now", docsNeeded: "Documents Required", schemes: [] },
      hindi: { title: "सरकारी योजना खोज", apply: "अभी आवेदन करें", docsNeeded: "आवश्यक दस्तावेज़", schemes: [] },
      marathi: { title: "शासकीय योजना शोध", apply: "आता अर्ज करा", docsNeeded: "आवश्यक कागदपत्रे", schemes: [] }
    };
    
    schemes.forEach(sc => {
      if(sc.translations.english) schemeDict.english.schemes.push({ id: sc.schemeId, name: sc.translations.english.name, docs: sc.translations.english.docs });
      if(sc.translations.hindi) schemeDict.hindi.schemes.push({ id: sc.schemeId, name: sc.translations.hindi.name, docs: sc.translations.hindi.docs });
      if(sc.translations.marathi) schemeDict.marathi.schemes.push({ id: sc.schemeId, name: sc.translations.marathi.name, docs: sc.translations.marathi.docs });
    });
    
    res.status(200).json(new ApiResponse(200, schemeDict, "Schemes fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getNptelCourses = async (req, res, next) => {
  try {
    await seedIfNeeded();
    const courses = await NptelCourse.find({});
    
    const formattedCourses = courses.map(c => ({
      id: c.courseId,
      title: c.title,
      institute: c.institute,
      duration: c.duration,
      level: c.level,
      relevance: c.relevance,
      url: c.url,
      rating: c.rating
    }));

    res.status(200).json(new ApiResponse(200, formattedCourses, "NPTEL courses fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const getSkillModules = async (req, res, next) => {
  try {
    await seedIfNeeded();
    const modules = await SkillModule.find({});
    
    const formattedModules = modules.map(m => ({
      id: m.moduleId,
      title: m.title,
      estimatedMinutes: m.estimatedMinutes,
      unlocksJobTier: m.unlocksJobTier,
      progressPercent: m.baseProgressPercent, // Usually mapped with user progress
      badgeEarned: m.baseProgressPercent === 100
    }));

    res.status(200).json(new ApiResponse(200, formattedModules, "Skill modules fetched successfully"));
  } catch (error) {
    next(error);
  }
};
