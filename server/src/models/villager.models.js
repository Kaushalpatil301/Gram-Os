import mongoose, { Schema } from 'mongoose';

// --- Government Schemes Model ---
const schemeTranslationSchema = new Schema({
  name: { type: String, required: true },
  docs: [{ type: String }]
}, { _id: false });

const schemeSchema = new Schema({
  schemeId: { type: String, required: true, unique: true },
  translations: {
    english: schemeTranslationSchema,
    hindi: schemeTranslationSchema,
    marathi: schemeTranslationSchema
  },
  applicableRoles: [{ type: String }]
}, { timestamps: true });

export const Scheme = mongoose.model("Scheme", schemeSchema);

// --- NPTEL Courses Model ---
const nptelCourseSchema = new Schema({
  courseId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  institute: { type: String, required: true },
  duration: { type: String, required: true },
  level: { type: String, required: true },
  relevance: { type: String, required: true },
  url: { type: String, required: true },
  rating: { type: Number, required: true }
}, { timestamps: true });

export const NptelCourse = mongoose.model("NptelCourse", nptelCourseSchema);

// --- Internal Skill Modules Model ---
const skillModuleSchema = new Schema({
  moduleId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  estimatedMinutes: { type: Number, required: true },
  unlocksJobTier: { type: String, required: true },
  baseProgressPercent: { type: Number, default: 0 }
}, { timestamps: true });

export const SkillModule = mongoose.model("SkillModule", skillModuleSchema);
