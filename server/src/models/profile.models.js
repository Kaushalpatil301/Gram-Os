import mongoose, { Schema } from 'mongoose';

// ─── Shared base fields (common to all stakeholders) ────────────────────────
const baseProfileFields = {
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  name:      { type: String, trim: true, default: '' },
  email:     { type: String, trim: true, default: '' },  // mirrors User.email for quick reads
  phone:     { type: String, trim: true, default: '' },
  location:  { type: String, trim: true, default: '' },
  bio:       { type: String, trim: true, default: '' },
  avatarUrl: { type: String, default: '' },
};

// ─── Farmer Profile ──────────────────────────────────────────────────────────
const farmerProfileSchema = new Schema(
  {
    ...baseProfileFields,
    // Basic info extras
    farmSize: { type: String, default: '' },
    crops: { type: String, default: '' },
    // Farm identity
    village: { type: String, default: '' },
    district: { type: String, default: '' },
    state: { type: String, default: '' },
    aadhaarLast4: { type: String, default: '' },
    landSizeAcres: { type: Number, default: 0 },
    soilType: { type: String, default: 'Black Cotton' },
    irrigationType: { type: String, default: 'Drip' },
    primaryCrops: { type: [String], default: [] },
    upiId: { type: String, default: '' },
    // Crop history
    cropHistory: [
      {
        season: String,
        crop: String,
        yield: String,
        soldTo: String,
        revenue: String,
        rating: Number,
      },
    ],
  },
  { timestamps: true }
);

// ─── Retailer Profile ────────────────────────────────────────────────────────
const retailerProfileSchema = new Schema(
  {
    ...baseProfileFields,
    storeName: { type: String, default: '' },
    storeAddress: { type: String, default: '' },
    businessType: { type: String, default: '' },
    gstNumber: { type: String, default: '' },
    panNumber: { type: String, default: '' },
    yearsInBusiness: { type: String, default: '' },
    specialization: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Consumer Profile ────────────────────────────────────────────────────────
const consumerProfileSchema = new Schema(
  {
    ...baseProfileFields,
    preferences: { type: [String], default: [] },   // dietary, organic, etc.
    deliveryAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

// ─── Villager Profile ────────────────────────────────────────────────────────
const villagerProfileSchema = new Schema(
  {
    ...baseProfileFields,
    aadhaarNumber: { type: String, default: '' },
    language: { type: String, default: 'marathi' },
    specialization: { type: String, default: '' },
    experience: { type: String, default: '' },
    skills: { type: [String], default: [] },
    // Gig stats
    gigScore: { type: Number, default: 0 },
    gigsCompleted: { type: Number, default: 0 },
    seasonEarnings: { type: Number, default: 0 },
    creditScore: { type: Number, default: 0 },
    loanEligible: { type: Boolean, default: false },
    badges: [
      {
        id: String,
        title: String,
        earnedDate: String,
      },
    ],
  },
  { timestamps: true }
);

export const FarmerProfile   = mongoose.model('FarmerProfile',   farmerProfileSchema);
export const RetailerProfile = mongoose.model('RetailerProfile', retailerProfileSchema);
export const ConsumerProfile = mongoose.model('ConsumerProfile', consumerProfileSchema);
export const VillagerProfile = mongoose.model('VillagerProfile', villagerProfileSchema);
