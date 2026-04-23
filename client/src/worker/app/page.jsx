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

// Worker specific sections
import AlertSection from "../components/sections/AlertSection.jsx";
import JobsSection from "../components/sections/JobsSection.jsx";
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
  LogOut, User, Menu, Sprout, HardHat, Award
} from "lucide-react";

const NAV_ITEMS = [
  { id: "profile",  label: "My Identity", icon: Shield, color: "text-emerald-600" },
  { id: "alert",    label: "Alerts",      icon: Bell, color: "text-red-600" },
  { id: "jobs",     label: "Jobs Market", icon: Briefcase, color: "text-emerald-600" },
  { id: "academy",  label: "Skills Academy", icon: BookOpen, color: "text-blue-600" },
  { id: "nptel",    label: "NPTEL Courses", icon: GraduationCap, color: "text-indigo-600" },
  { id: "earnings", label: "Earnings",    icon: IndianRupee, color: "text-amber-600" },
  { id: "scanner",  label: "QR Scanner",  icon: QrCode, color: "text-emerald-600" },
  { id: "schemes",  label: "Govt Schemes", icon: Landmark, color: "text-emerald-700" },
];

function WorkerContent() {
  const { currentLanguage } = useTranslation();
  const [notification, setNotification] = useState("");
  const [activeSection, setActiveSection] = useState("jobs");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // ── localStorage-backed state ──
  const [workerProfile, setWorkerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("workerProfile");
      return saved ? { ...DEFAULT_PROFILE, ...JSON.parse(saved) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });



  const [moduleProgress, setModuleProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("workerModuleProgress") ?? "{}");
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
      localStorage.setItem("workerProfile", JSON.stringify(workerProfile));
    } catch {}
  }, [workerProfile]);



  useEffect(() => {
    try {
      localStorage.setItem("workerModuleProgress", JSON.stringify(moduleProgress));
    } catch {}
  }, [moduleProgress]);

  // ── Language sync ──
  useEffect(() => {
    const mapped = LANG_MAP[currentLanguage];
    if (mapped && mapped !== workerProfile.language) {
      setWorkerProfile((prev) => ({ ...prev, language: mapped }));
      showNotification("Language updated");
    }
  }, [currentLanguage]);

  // ── Derived data ──
  const jobs = useMemo(() => {
    return RAW_JOBS.map((j) => ({
      ...j,
      skillMatchPercent: computeMatch(workerProfile.badges, j.requiredBadges),
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
  }, [workerProfile.badges, maxDistance, cropFilter, voiceQuery]);

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
      seasonTotal: workerProfile.seasonEarnings,
      avgDaily: 600,
      districtAvg: 560,
      creditScore: workerProfile.creditScore,
      loanEligible: workerProfile.loanEligible,
    }),
    [workerProfile]
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
      workerProfile.language === "marathi"
        ? "mr-IN"
        : workerProfile.language === "hindi"
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
      case "alert":
        return <AlertSection urgentJob={urgentJob} onApply={showNotification} />;

      case "jobs":
        return (
          <JobsSection
            jobs={jobs}
            cropFilter={cropFilter}
            setCropFilter={setCropFilter}
            maxDistance={maxDistance}
            setMaxDistance={setMaxDistance}
            voiceQuery={voiceQuery}
            setVoiceQuery={setVoiceQuery}
            isListening={isListening}
            toggleVoice={toggleVoice}
            showNotification={showNotification}
          />
        );

      case "academy":
        return <AcademySection modules={modules} onAdvance={advanceModule} />;

      case "nptel":
        return <NptelSection courses={NPTEL_COURSES} showNotification={showNotification} />;

      case "earnings":
        return <EarningsSection earnings={earnings} />;



      case "schemes":
        return <SchemesSection />;

      default:
        return (
          <JobsSection
            jobs={jobs}
            cropFilter={cropFilter}
            setCropFilter={setCropFilter}
            maxDistance={maxDistance}
            setMaxDistance={setMaxDistance}
            voiceQuery={voiceQuery}
            setVoiceQuery={setVoiceQuery}
            isListening={isListening}
            toggleVoice={toggleVoice}
            showNotification={showNotification}
          />
        );
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
                Workforce Dashboard
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
            <span className="truncate">{workerProfile.name || "Worker"}</span>
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
            {activeSection === "alert" ? "Alerts" : NAV_ITEMS.find(n => n.id === activeSection)?.label}
          </h2>

          <div className="flex items-center gap-3">
            <button onClick={() => goTo("alert")} className="relative p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
              <Bell className="w-7 h-7" />
              {urgentJob && <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
            <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
              <Award className="w-5 h-5 text-amber-600" />
              <span className="text-base font-bold text-amber-700">{workerProfile.gigScore || "720"}</span>
            </div>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <div className="p-6">
          {renderSection()}
        </div>

        {/* Re-using worker specific helpers */}
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

export default function WorkerPage() {
  return (
    <LanguageProvider>
      <WorkerContent />
    </LanguageProvider>
  );
}