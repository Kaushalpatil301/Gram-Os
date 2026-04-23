"use client";
import React, { useState, useEffect } from "react";
import { LanguageProvider, useTranslation } from "../i18n/config";
import ScanModal from "../components/ScanModal";
import LoadingOverlay from "../components/LoadingOverlay";
import Notification from "../components/Notification";
import Chatbot from "./Chatbot";
import { useNavigate } from "react-router-dom";

// Standard GramOS Layout Icons
import {
  QrCode,
  Flag,
  History,
  LogOut,
  User,
  Menu,
  Shield,
  Sprout
} from "lucide-react";

import ScanSection from "../components/ScanSection";
import InfoSection from "../components/InfoSection";

const NAV_ITEMS = [
  { id: "scan", label: "Scanner", icon: QrCode, color: "text-emerald-600" },
  { id: "info", label: "Information", icon: Shield,     color: "text-blue-600" },
];

function ConsumerContent() {
  const { t, currentLanguage } = useTranslation();
  const [activeSection, setActiveSection] = useState("scan");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Scan State
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [notification, setNotification] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) setScanHistory(JSON.parse(saved));
  }, []);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  useEffect(() => {
    const handleModal = (e) => {
      if (e.detail?.modal === "scan" || e.detail?.modal === "qr") setShowScanModal(true);
    };
    const handleAction = (e) => {
       if (e.detail?.action === "logout") {
          localStorage.removeItem("user");
          localStorage.removeItem("userSession");
          window.location.href = "/";
       }
    };
    const handleNavigate = (e) => {
      if (e.detail?.section) goTo(e.detail.section);
    };

    window.addEventListener("AGRIBOT_MODAL", handleModal);
    window.addEventListener("AGRIBOT_ACTION", handleAction);
    window.addEventListener("AGRIBOT_NAVIGATE", handleNavigate);

    return () => {
      window.removeEventListener("AGRIBOT_MODAL", handleModal);
      window.removeEventListener("AGRIBOT_ACTION", handleAction);
      window.removeEventListener("AGRIBOT_NAVIGATE", handleNavigate);
    };
  }, []);

  const handleScan = (decodedText) => {
    console.log("Consumer scanned:", decodedText);
    const productIdMatch = decodedText.match(/\/product\/([a-zA-Z0-9]+)/);
    if (productIdMatch) {
      const productId = productIdMatch[1];
      window.location.href = `/consumer/product/${productId}`;
      return;
    }
    window.location.href = decodedText;
  };

  const handleLogout = () => {
    localStorage.removeItem("scanHistory");
    localStorage.removeItem("userSession");
    localStorage.removeItem("issueReports");
    navigate("/");
  };

  const goTo = (id) => {
    setActiveSection(id);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSection = () => {
    switch (activeSection) {
      case "scan":
        return (
          <div className="max-w-2xl mx-auto py-8">
             <ScanSection 
                scanHistory={scanHistory}
                onScanClick={() => setShowScanModal(true)}
             />
          </div>
        );
      case "info":
        return (
          <div className="max-w-2xl mx-auto py-8 space-y-6">
              <InfoSection onNotification={showNotification} />
          </div>
        );
      default:
        return null;
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

      {/* Sidebar */}
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
                Consumer Portal
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
          <div className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium text-gray-600 mb-2">
             <User className="w-6 h-6 text-gray-400" />
             <span className="truncate">Guest User</span>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 mt-2 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-6 h-6 text-red-500" />
            <span>Exit Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto">
        {/* Top bar */}
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors">
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          <h2 className="text-xl font-bold text-gray-800">
            {NAV_ITEMS.find(n => n.id === activeSection)?.label}
          </h2>

          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
            <History className="w-5 h-5 text-emerald-600" />
            <span className="text-base font-bold text-emerald-700">{scanHistory.length} Scans</span>
          </div>
        </header>

        {/* Dynamic Section Content */}
        <div className="p-6">
          {renderSection()}
        </div>
      </main>

      {/* Utilities */}
      <ScanModal
        isVisible={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScan}
      />
      <LoadingOverlay isVisible={isScanning} />
      <Notification message={notification} />
      <Chatbot />
    </div>
  );
}

export default function ConsumerHomePage() {
  return (
    <LanguageProvider>
      <ConsumerContent />
    </LanguageProvider>
  );
}
