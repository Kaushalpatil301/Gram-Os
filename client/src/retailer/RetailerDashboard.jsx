"use client";
import { useState, useEffect } from "react";
import BrowseProducts from "./components/BrowseProducts";
import Analytics from "./components/Analytics";
import FarmerNetwork from "./components/FarmerNetwork";
import Contracts from "./components/Contracts";
import QRScanner from "./components/QRScanner";
import ProfileModal from "./components/ProfileModal";
import Notification from "../product/components/Notification.jsx";
import Chatbot from "../consumer/app/Chatbot.jsx";
import ChatSection from "./components/ChatSection.jsx";
import SchemesSection from "../farmer/components/sections/schemes-section.jsx";
import CreditSection from "../farmer/components/sections/credit-section.jsx";
import LoanSection from "../farmer/components/sections/loan-section.jsx";
import WorkforceSection from "../farmer/components/sections/workforce-section.jsx";
import { useNavigate } from "react-router-dom";
import { LanguageProvider } from "../consumer/i18n/config.jsx";
import LanguageDropdown from "../consumer/components/LanguageDropdown.jsx";

import {
  Package,
  Landmark,
  BarChart3,
  Users,
  FileText,
  QrCode,
  LogOut,
  User,
  Menu,
  Sprout,
  Award,
  Bell,
  MessageSquare,
  DollarSign,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "browse",
    label: "Product Sourcing",
    icon: Package,
    color: "text-emerald-600",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    color: "text-blue-600",
  },
  {
    id: "network",
    label: "Farmer Network",
    icon: Users,
    color: "text-orange-600",
  },
  {
    id: "workforce",
    label: "Workforce Hub",
    icon: Users,
    color: "text-orange-600",
  },
  {
    id: "contracts",
    label: "Contracts",
    icon: FileText,
    color: "text-purple-600",
  },
  { id: "credit", label: "Trust Score", icon: Award, color: "text-amber-600" },
  {
    id: "loans",
    label: "Bank Loans",
    icon: DollarSign,
    color: "text-blue-600",
  },
  {
    id: "schemes",
    label: "Govt Schemes",
    icon: Landmark,
    color: "text-indigo-600",
  },
  { id: "qr", label: "QR Scanner", icon: QrCode, color: "text-emerald-600" },
];

export default function RetailerDashboard() {
  const [activeSection, setActiveSection] = useState("browse");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeChats, setActiveChats] = useState([]);
  const [notification, setNotification] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order_accepted",
      farmerName: "Ram Singh",
      topic: "Accepted your order for 500kg Organic Tomatoes",
    },
    {
      id: 2,
      type: "job_accepted",
      workerName: "Sunita Pawar",
      topic: "Accepted your job offer for Warehouse Sorting",
    },
  ]);

  const showNotificationToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleAcceptConnect = (notif) => {
    if (!activeChats.find((chat) => chat.id === notif.id)) {
      setActiveChats((prev) => [
        ...prev,
        { id: notif.id, name: notif.farmerName, topic: notif.topic },
      ]);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setShowNotifications(false);
    showNotificationToast("Connected!");
    goTo("chat");
  };

  const navigate = useNavigate();

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
      case "browse":
        return <BrowseProducts />;
      case "analytics":
        return <Analytics />;
      case "network":
        return <FarmerNetwork />;
      case "workforce":
        return <WorkforceSection />;
      case "contracts":
        return <Contracts />;
      case "credit":
        return <CreditSection />;
      case "loans":
        return <LoanSection />;
      case "schemes":
        return <SchemesSection />;
      case "qr":
        return <QRScanner />;
      case "chat":
        return <ChatSection activeChats={activeChats} />;
      default:
        return <BrowseProducts />;
    }
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Logo */}
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-xl">
                <Sprout className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <h1 className="text-xl font-black text-gray-900">GramOS</h1>
                <p className="text-[10px] text-gray-400 uppercase font-semibold">
                  Retailer OS
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
                    <Icon
                      className={`w-6 h-6 ${isActive ? "text-white" : item.color || "text-gray-500"}`}
                    />
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
              <span className="truncate">Retailer Admin</span>
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
          {/* Top bar */}
          <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-30 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>

            <h2 className="text-xl font-bold text-gray-800">
              {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
            </h2>

            <div className="flex items-center gap-3">
              <LanguageDropdown
                buttonClassName="relative flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 focus:outline-none"
                iconClassName="w-5 h-5"
                chevronClassName="w-4 h-4 transition-transform"
                menuClassName="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50"
              />

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 focus:outline-none"
                >
                  <Bell className="w-6 h-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-50">
                    <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                      {notifications.length > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                          {notifications.length} New
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500 text-sm font-medium">
                          No new notifications
                        </div>
                      )}
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 border-b border-gray-50 transition-colors hover:bg-emerald-50/30 cursor-pointer"
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === "order_accepted" ? "bg-emerald-100" : "bg-blue-100"}`}
                            >
                              {notif.type === "order_accepted" ? (
                                <Package className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Users className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {notif.type === "order_accepted" ? (
                                  <>
                                    Farmer{" "}
                                    <span className="font-bold text-emerald-700">
                                      {notif.farmerName}
                                    </span>{" "}
                                    accepted order
                                  </>
                                ) : (
                                  <>
                                    Worker{" "}
                                    <span className="font-bold text-blue-700">
                                      {notif.workerName}
                                    </span>{" "}
                                    accepted job
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notif.topic}
                              </p>
                              <div className="flex gap-2 mt-3">
                                {notif.type === "order_accepted" ? (
                                  <button
                                    onClick={() => {
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== notif.id),
                                      );
                                      goTo("contracts");
                                    }}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg shadow-sm font-semibold transition-colors cursor-pointer"
                                  >
                                    View Order
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== notif.id),
                                      );
                                      goTo("workforce");
                                    }}
                                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg shadow-sm font-semibold transition-colors cursor-pointer"
                                  >
                                    View Job
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Dynamic Section Content */}
          <div className="p-6">{renderSection()}</div>

          {/* Chatbot & Notification */}
          <Notification message={notification} />
          <Chatbot />
        </main>

        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </div>
    </LanguageProvider>
  );
}
