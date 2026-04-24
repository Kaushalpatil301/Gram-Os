import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/forms/LoginForm";
import SignupForm from "../components/forms/SignupForm";
import ProfileSetupWizard from "../components/ProfileSetupWizard";
import { prefetchTrustLoanData } from "../../lib/trustLoanCache";

export default function AuthPage({ onAuthSuccess }) {
  const [tab, setTab] = useState("login");
  const [setupUser, setSetupUser] = useState(null); // non-null triggers wizard
  const navigate = useNavigate();

  // ── Called after login (skip wizard — profile already exists) ─────────────
  const handleLoginSuccess = async (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    if (onAuthSuccess) onAuthSuccess(data);
    await prefetchTrustLoanData({ user: data });
    navigate(`/dashboard/${data.role || "consumer"}`);
  };

  // ── Called after signup — show profile setup wizard ───────────────────────
  const handleSignupSuccess = (data) => {
    localStorage.setItem("user", JSON.stringify(data));
    if (onAuthSuccess) onAuthSuccess(data);
    setSetupUser(data); // opens the wizard (doesn't navigate yet)
  };

  // ── Called when wizard finishes (or is skipped) ───────────────────────────
  const handleWizardComplete = async (user) => {
    await prefetchTrustLoanData({ user });
    setSetupUser(null);
    navigate(`/dashboard/${user?.role || "consumer"}`);
  };

  return (
    <>
      {/* ── Wizard overlay (shown after signup) ─────────────────────────── */}
      {setupUser && (
        <ProfileSetupWizard
          user={setupUser}
          onComplete={handleWizardComplete}
        />
      )}

      {/* ── Auth card ────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 flex items-center justify-center p-4">
        <main className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
          {/* Header */}
          <header className="text-center mb-6">
            <div className="mx-auto mb-3 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
              🌱
            </div>
            <h1 className="text-2xl font-bold text-gray-900">GramOS</h1>
            <p className="text-sm text-gray-600">India's Rural Economic OS</p>
          </header>

          {/* Tabs */}
          <nav className="flex border-b mb-6">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === "login"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                tab === "signup"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
          </nav>

          {/* Forms */}
          <div>
            {tab === "login" ? (
              <LoginForm onSuccess={handleLoginSuccess} />
            ) : (
              <SignupForm onSuccess={handleSignupSuccess} />
            )}
          </div>
        </main>
      </div>
    </>
  );
}
