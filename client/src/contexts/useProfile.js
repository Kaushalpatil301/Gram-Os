/**
 * useProfile — shared React hook for fetching & saving stakeholder profiles.
 *
 * Data priority:  MongoDB DB  >  localStorage  >  empty
 *
 * Usage:
 *   const { user, profile, loading, error, saving, saveProfile } = useProfile();
 *
 * - `user`        — base User doc (email, username, role, _id, …)
 * - `profile`     — role-specific profile object from MongoDB
 * - `loading`     — true while the initial DB fetch is in progress
 * - `error`       — error message string or null
 * - `saving`      — true while a PUT is in-flight
 * - `saveProfile` — async (updates: object) => void  — PUT to /api/v1/profile/me
 * - `refetch`     — re-fetch from DB manually
 */

import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "../lib/api.js";

// Read the user object saved by the auth page on login/signup
function getLocalUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export function useProfile() {
  const localUser = getLocalUser();

  // Seed state immediately from localStorage so the UI is never blank
  const [user, setUser]       = useState(localUser);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [saving, setSaving]   = useState(false);

  // ── Fetch from DB on mount ──────────────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/profile/me");
      const dbUser    = data?.data?.user    ?? null;
      const dbProfile = data?.data?.profile ?? {};

      setUser(dbUser);
      setProfile(dbProfile);

      // Keep localStorage in sync with what the server returns
      if (dbUser) {
        localStorage.setItem("user", JSON.stringify(dbUser));
      }
    } catch (err) {
      // 401 = not logged in via Express (e.g. Firebase-only user) — not a crash
      if (!err.message?.includes("401")) {
        console.warn("[useProfile] fetch error:", err.message);
      }
      setError(err.message);
      // Fall back to whatever localStorage had
      setUser(localUser);
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // ── Save (PUT) to DB ────────────────────────────────────────────────────────
  const saveProfile = useCallback(async (updates) => {
    setSaving(true);
    setError(null);
    try {
      const data = await apiFetch("/profile/me", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      const saved = data?.data?.profile ?? updates;
      setProfile(saved);
      return saved;
    } catch (err) {
      console.error("[useProfile] save failed:", err.message);
      setError(err.message);
      throw err;   // rethrow so the modal can show the amber banner
    } finally {
      setSaving(false);
    }
  }, []);

  return { user, profile, loading, error, saving, saveProfile, refetch: fetchProfile };
}
