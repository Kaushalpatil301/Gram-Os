"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { LanguageProvider, useTranslation } from "../../consumer/i18n/config.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";
import { useNavigate } from "react-router-dom";

// Layout components — bringing in the sidebar pattern from Farmer
import ProfileModal from "../components/ProfileModal.jsx";

// Section components (Farmer specific sections as requested)
import SchemesSection from "../../farmer/components/sections/schemes-section.jsx";
import CreditSection from "../../farmer/components/sections/credit-section.jsx";
import LoanSection from "../../farmer/components/sections/loan-section.jsx";
import WorkforceSection from "../../farmer/components/sections/workforce-section.jsx";

// Villager specific sections
import AlertSection from "../components/sections/AlertSection.jsx";
import AcademySection from "../components/sections/AcademySection.jsx";
import NptelSection from "../components/sections/NptelSection.jsx";
import EarningsSection from "../components/sections/EarningsSection.jsx";


// Data & helpers
import {
  DEFAULT_PROFILE,
  RAW_JOBS,
  INTERNAL_MODULES,
  NPTEL_COURSES,
  LANG_MAP,
  computeMatch,
  toHours,
} from "../lib/data.js";

import {
  Shield, Briefcase, BookOpen, GraduationCap,
  IndianRupee, QrCode, Landmark, Bell,
  LogOut, User, Menu, Sprout, HardHat, Award, DollarSign
} from "lucide-react";

const NAV_ITEMS = [
  { id: "jobs",     label: "Jobs Market", icon: Briefcase, color: "text-emerald-600" },
  { id: "academy",  label: "Skills Academy", icon: BookOpen, color: "text-blue-600" },
  { id: "nptel",    label: "NPTEL Courses", icon: GraduationCap, color: "text-indigo-600" },
  { id: "earnings", label: "Earnings", icon: IndianRupee, color: "text-amber-600" },
  { id: "credit",   label: "Trust Score", icon: Award, color: "text-amber-600" },
  { id: "loans",    label: "Bank Loans", icon: DollarSign, color: "text-blue-600" },
  { id: "schemes",  label: "Govt Schemes", icon: Landmark, color: "text-emerald-700" },
];

function VillagerContent() {
  const { currentLanguage } = useTranslation();
  const [notification, setNotification] = useState("");
  const [activeSection, setActiveSection] = useState("jobs");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // ── localStorage-backed state ──
  const [villagerProfile, setVillagerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("villagerProfile");
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });



  const [moduleProgress, setModuleProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("villagerModuleProgress") ?? "{}");
    } catch {
      return {};
    }
  });

  const [cropFilter, setCropFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(50);
  const [isListening, setIsListening] = useState(false);
  const [voiceQuery, setVoiceQuery] = useState("");

  // ── Persist to localStorage ──
  useEffect(() => {
    try {
      localStorage.setItem("villagerProfile", JSON.stringify(villagerProfile));
    } catch {}
  }, [villagerProfile]);



  useEffect(() => {
    try {
      localStorage.setItem("villagerModuleProgress", JSON.stringify(moduleProgress));
    } catch {}
  }, [moduleProgress]);

  // ── Language sync ──
  useEffect(() => {
    const mapped = LANG_MAP[currentLanguage];
    if (mapped && mapped !== villagerProfile.language) {
      setVillagerProfile((prev) => ({ ...prev, language: mapped }));
      showNotification("Language updated");
    }
  }, [currentLanguage]);

  // ── Derived data ──
  const jobs = useMemo(() => {
    return RAW_JOBS.map((j) => ({
      ...j,
      skillMatchPercent: computeMatch(villagerProfile.badges, j.requiredBadges),
    })).filter((j) => {
      const distOk = j.distanceKm <= maxDistance;
      const cropOk =
        cropFilter === "all" ||
        j.cropType.toLowerCase().includes(cropFilter.toLowerCase());
      const voiceOk =
        !voiceQuery ||
        j.cropType.toLowerCase().includes(voiceQuery.toLowerCase()) ||
        j.location.toLowerCase().includes(voiceQuery.toLowerCase());
      return distOk && cropOk && voiceOk;
    });
  }, [villagerProfile.badges, maxDistance, cropFilter, voiceQuery]);

  const urgentJob = useMemo(
    () =>
      jobs.length > 0
        ? [...jobs].sort(
            (a, b) =>
              toHours(a.expiresIn) - toHours(b.expiresIn) ||
              a.distanceKm - b.distanceKm
          )[0]
        : null,
    [jobs]
  );

  const earnings = useMemo(
    () => ({
      weekly: 4 * 600,
      seasonTotal: villagerProfile.seasonEarnings,
      avgDaily: 600,
      districtAvg: 560,
      creditScore: villagerProfile.creditScore,
      loanEligible: villagerProfile.loanEligible,
    }),
    [villagerProfile]
  );

  const modules = useMemo(
    () =>
      INTERNAL_MODULES.map((m) => ({
        ...m,
        progressPercent: moduleProgress[m.id] ?? m.progressPercent,
      })),
    [moduleProgress]
  );

  // ── Helpers ──
  function showNotification(msg) {
    setNotification(msg);
    setTimeout(() => setNotification(""), 2500);
  }



  function advanceModule(id) {
    setModuleProgress((prev) => {
      const base = INTERNAL_MODULES.find((m) => m.id === id)?.progressPercent ?? 0;
      const current = prev[id] ?? base;
      const next = Math.min(100, current + 20);
      showNotification(
        next === 100 ? "Module complete! Badge earned." : `Progress saved: ${next}%`
      );
      return { ...prev, [id]: next };
    });
  }

  function toggleVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showNotification("Voice not supported on this browser");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }

    const rec = new SR();
    rec.lang =
      villagerProfile.language === "marathi"
        ? "mr-IN"
        : villagerProfile.language === "hindi"
        ? "hi-IN"
        : "en-IN";
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => {
      setIsListening(false);
      showNotification("Could not hear — try again");
    };
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setVoiceQuery(text);
      showNotification(`Searching: "${text}"`);
    };
    rec.start();
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userSession");
    navigate("/");
  };

  const goTo = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handleNavigate = (e) => {
      if (e.detail?.section) goTo(e.detail.section);
    };
    const handleModal = (e) => {
      if (e.detail?.modal === "profile") setShowProfileModal(true);
    };
    const handleAction = (e) => {
      if (e.detail?.action === "logout") handleLogout();
    };

    window.addEventListener("AGRIBOT_NAVIGATE", handleNavigate);
    window.addEventListener("AGRIBOT_MODAL", handleModal);
    window.addEventListener("AGRIBOT_ACTION", handleAction);

    return () => {
      window.removeEventListener("AGRIBOT_NAVIGATE", handleNavigate);
      window.removeEventListener("AGRIBOT_MODAL", handleModal);
      window.removeEventListener("AGRIBOT_ACTION", handleAction);
    };
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "jobs":
        return <WorkforceSection />;

      case "academy":
        return <AcademySection modules={modules} onAdvance={advanceModule} />;

      case "nptel":
        return <NptelSection courses={NPTEL_COURSES} showNotification={showNotification} />;

      case "earnings":
        return <EarningsSection earnings={earnings} />;



      case "schemes":
        return <SchemesSection />;

      case "credit":
        return <CreditSection />;

      case "loans":
        return <LoanSection />;

      default:
        return <WorkforceSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — Exact same structure as Farmer */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Logo */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <Sprout className="w-6 h-6 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">GramOS</h1>
              <p className="text-[10px] text-gray-400 uppercase font-semibold">
                Villager Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => goTo(item.id)}
                  className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-base transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white font-semibold shadow-md"
                      : "text-gray-700 hover:bg-emerald-50 font-medium"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : item.color || 'text-gray-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User profile button */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
          >
            <User className="w-6 h-6 text-gray-500" />
            <span className="truncate">{villagerProfile.name || "Villager"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 mt-2 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-6 h-6 text-red-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Top bar — Exact same structure as Farmer */}
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <h2 className="text-xl font-bold text-gray-800">
            {NAV_ITEMS.find(n => n.id === activeSection)?.label || "Dashboard"}
          </h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 focus:outline-none"
              >
                <Bell className="w-7 h-7" />
                {urgentJob && <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-900">Alerts</h3>
                    {urgentJob && <span className="bg-red-100 text-red-600 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">1 New</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {!urgentJob ? (
                      <div className="p-6 text-center text-gray-500 text-sm font-medium">No active alerts</div>
                    ) : (
                      <div className="p-4 border-b border-gray-50 hover:bg-amber-50/50 transition-colors">
                        <AlertSection urgentJob={urgentJob} onApply={(msg) => {
                          showNotification(msg);
                          setShowNotifications(false);
                        }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-base font-bold text-amber-700">{villagerProfile.gigScore || "720"}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <div className="p-6">
          {renderSection()}
        </div>

        {/* Re-using villager specific helpers */}
        <Chatbot />
        <Notification message={notification} />
      </main>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
}

export default function VillagerPage() {
  return (
    <LanguageProvider>
      <VillagerContent />
    </LanguageProvider>
  );
}