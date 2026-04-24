import { apiFetch } from "./api.js";
import {
  calculateExpectedLoan,
  fetchAICreditScore,
} from "../farmer/lib/creditEngine";

const CACHE_KEY = "gramos_trust_loan_cache_v1";
const CACHE_TTL_MS = 30 * 60 * 1000;

function getUserCacheId(user) {
  return user?._id || user?.id || user?.email || null;
}

export function normalizeRole(role) {
  return role === "worker" ? "villager" : role || "farmer";
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
  } catch {
    return null;
  }
}

function writeCache(payload) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

function isCacheFresh(cache, user) {
  if (!cache || !cache.updatedAt) return false;
  const age = Date.now() - cache.updatedAt;
  return cache.userId === getUserCacheId(user) && age < CACHE_TTL_MS;
}

async function resolveProfile(profile) {
  if (profile && Object.keys(profile).length > 0) return profile;
  try {
    const me = await apiFetch("/profile/me");
    return me?.data?.profile || {};
  } catch {
    return {};
  }
}

export function getCachedTrustLoanData(user) {
  const cache = readCache();
  if (!isCacheFresh(cache, user)) return null;
  return cache;
}

export async function prefetchTrustLoanData({ user, profile } = {}) {
  const cache = readCache();
  if (isCacheFresh(cache, user)) return cache;

  const role = normalizeRole(user?.role);
  const profileData = await resolveProfile(profile);
  const [credit, banksResponse] = await Promise.all([
    fetchAICreditScore(role, profileData || {}),
    apiFetch("/loans/banks").catch(() => ({ success: false, data: [] })),
  ]);

  const payload = {
    userId: getUserCacheId(user),
    role,
    updatedAt: Date.now(),
    credit,
    banks: banksResponse?.success ? banksResponse.data || [] : [],
    maxLoanAmount: calculateExpectedLoan(profileData, credit?.score || 0),
  };

  writeCache(payload);
  return payload;
}
