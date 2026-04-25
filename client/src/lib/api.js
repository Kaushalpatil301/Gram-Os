/**
 * Centralized API utility for GramOS.
 * All fetch calls go through here so the base URL can be switched easily.
 */

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

/**
 * Generic JSON fetch wrapper.
 * Auth is handled via HTTP-only cookies (accessToken) set by the server on login.
 * credentials: "include" ensures cookies are sent cross-origin automatically.
 *
 * @param {string} path  - e.g. "/profile/me"
 * @param {RequestInit} opts
 */
export async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",      // sends the accessToken cookie automatically
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

/**
 * Logout helper - calls backend to clear HTTP-only cookies and clears localStorage
 */
export async function apiLogout() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch (error) {
    console.warn("Logout API call failed (ignoring):", error);
  } finally {
    // Always clear localStorage regardless of API success
    localStorage.removeItem("user");
    localStorage.removeItem("userSession");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("villagerProfile");
    localStorage.removeItem("villagerScanHistory");
    localStorage.removeItem("villagerModuleProgress");
    localStorage.removeItem("scanHistory");
    localStorage.removeItem("issueReports");
  }
}
