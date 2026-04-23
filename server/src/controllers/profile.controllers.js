import { User } from '../models/user.models.js';
import { ApiResponse } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  FarmerProfile,
  RetailerProfile,
  ConsumerProfile,
  VillagerProfile,
} from '../models/profile.models.js';

// ─── Model selector by role ──────────────────────────────────────────────────
const getModelForRole = (role) => {
  switch (role) {
    case 'farmer':   return FarmerProfile;
    case 'retailer': return RetailerProfile;
    case 'consumer': return ConsumerProfile;
    case 'villager': return VillagerProfile;
    default:         return null;
  }
};

// ─── Auto-create profile with seed data from User doc ────────────────────────
const createProfileForUser = async (user) => {
  const Model = getModelForRole(user.role);
  if (!Model) return null;

  // Only create if one doesn't already exist
  const existing = await Model.findOne({ userId: user._id });
  if (existing) return existing;

  const seedData = {
    userId:   user._id,
    name:     user.username || '',
    email:    user.email    || '',   // stored in basic for farmer/retailer/consumer
    location: user.location?.address || '',
  };

  return await Model.create(seedData);
};

// ─── GET /api/v1/profile/me  ──────────────────────────────────────────────────
// Returns the current user's base User doc + their role-specific profile.
// Auto-creates a blank profile if this is the user's first access.
const getMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role   = req.user.role;

  const Model = getModelForRole(role);

  let profile = Model ? await Model.findOne({ userId }) : null;

  // Auto-create on first access (upsert with seed data from User doc)
  if (!profile && Model) {
    profile = await createProfileForUser(req.user);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      user: req.user,
      profile: profile ?? {},
    }, 'Profile fetched successfully')
  );
});

// ─── PUT /api/v1/profile/me  ──────────────────────────────────────────────────
// Upserts role-specific profile for the logged-in user.
const updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const role   = req.user.role;

  const Model = getModelForRole(role);
  if (!Model) {
    throw new ApiError(400, `No profile model for role: ${role}`);
  }

  // Strip out fields that shouldn't be overwritten via this endpoint
  const { _id, userId: _uid, createdAt, updatedAt, __v, ...updates } = req.body;

  // Always keep email in sync with the User document (authoritative source)
  updates.email = req.user.email || updates.email || '';

  const profile = await Model.findOneAndUpdate(
    { userId },
    { $set: { ...updates, userId } },
    { upsert: true, new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { profile }, 'Profile updated successfully')
  );
});

// ─── GET /api/v1/profile/:role/:userId  (public lookup, used by other dashboards)
const getProfileByUser = asyncHandler(async (req, res) => {
  const { role, userId } = req.params;

  const Model = getModelForRole(role);
  if (!Model) {
    throw new ApiError(400, `Invalid role: ${role}`);
  }

  const profile = await Model.findOne({ userId });
  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }

  return res.status(200).json(
    new ApiResponse(200, { profile }, 'Profile fetched successfully')
  );
});

// ─── GET /api/v1/profile/users/:role  (list all users of a given role)
const listUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;

  const allowedRoles = ['farmer', 'retailer', 'consumer', 'villager'];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, `Invalid role: ${role}`);
  }

  const Model = getModelForRole(role);

  // Get all user IDs for this role
  const users = await User.find({ role })
    .select('-password -refreshToken -emailVerificationToken -emailVerificationExpiry -forgotPasswordToken -forgotPasswordExpiry')
    .lean();

  // Fetch their profiles
  const userIds = users.map(u => u._id);
  const profiles = Model
    ? await Model.find({ userId: { $in: userIds } }).lean()
    : [];

  // Merge: user + profile keyed by userId
  const profileMap = {};
  profiles.forEach(p => { profileMap[String(p.userId)] = p; });

  const merged = users.map(u => ({
    ...u,
    profile: profileMap[String(u._id)] ?? {},
  }));

  return res.status(200).json(
    new ApiResponse(200, { users: merged, count: merged.length }, `${role} profiles fetched`)
  );
});

export { getMyProfile, updateMyProfile, getProfileByUser, listUsersByRole };
