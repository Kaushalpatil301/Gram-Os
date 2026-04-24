import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LanguageProvider,
  useTranslation,
} from "../../consumer/i18n/config.jsx";
import LanguageDropdown from "../../consumer/components/LanguageDropdown.jsx";
import Notification from "../../product/components/Notification.jsx";
import ProfileModal from "../components/ProfileModal";

// Sections

import MarketplaceSection from "../components/sections/marketplace-section";
import WorkforceSection from "../components/sections/workforce-section";

import CreditSection from "../components/sections/credit-section";
import SchemesSection from "../components/sections/schemes-section";
import ProduceSection from "../components/sections/produce-section";
import ScannerSection from "../components/sections/scanner-section";
import MapSection from "../components/sections/map-section";
import ChatSection from "../components/sections/chat-section";
import LoanSection from "../components/sections/loan-section";

// Extras
import Chatbot from "../../consumer/app/Chatbot.jsx";
import { initialProduce } from "../lib/data";

import {
  ShoppingCart,
  Users,
  Award,
  Landmark,
  Warehouse,
  QrCode,
  Map,
  LogOut,
  User,
  Menu,
  Sprout,
  Bell,
  Package,
  MessageSquare,
  DollarSign,
} from "lucide-react";

const NAV_ITEMS = [
  {
    id: "marketplace",
    labelKey: "farmer.nav.marketplace",
    icon: ShoppingCart,
    color: "text-emerald-600",
  },
  {
    id: "produce",
    labelKey: "farmer.nav.produce",
    icon: Warehouse,
    color: "text-emerald-600",
  },
  {
    id: "workforce",
    labelKey: "farmer.nav.workforce",
    icon: Users,
    color: "text-orange-600",
  },
  {
    id: "scanner",
    labelKey: "farmer.nav.scanner",
    icon: QrCode,
    color: "text-emerald-600",
  },
  { id: "map", labelKey: "farmer.nav.map", icon: Map, color: "text-emerald-600" },
  { id: "credit", labelKey: "farmer.nav.credit", icon: Award, color: "text-amber-600" },
  {
    id: "loans",
    labelKey: "farmer.nav.loans",
    icon: DollarSign,
    color: "text-blue-600",
  },
  {
    id: "schemes",
    labelKey: "farmer.nav.schemes",
    icon: Landmark,
    color: "text-indigo-600",
  },
];

function FarmerPageContent({ onLogout }) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState("marketplace");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [produce, setProduce] = useState(initialProduce);
  const [activeChats, setActiveChats] = useState([]);
  const [notification, setNotification] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "order_request",
      retailerName: "FreshMart",
      topic: t("notifications.topic.orderRequest", {
        qty: 500,
        unit: "kg",
        product: "Organic Tomatoes",
      }),
    },
    {
      id: 2,
      type: "job_applicant",
      applicantName: "Sunita Pawar",
      topic: t("notifications.topic.jobApplicant", {
        job: "Onion Harvest Job",
      }),
    },
    {
      id: 3,
      type: "order_request",
      retailerName: "Reliance Fresh",
      topic: t("notifications.topic.orderRequest", {
        qty: 1000,
        unit: "kg",
        product: "Sona Masuri Rice",
      }),
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
        { id: notif.id, name: notif.retailerName, topic: notif.topic },
      ]);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    setShowNotifications(false);
    showNotificationToast(t("farmer.notifications.connected"));
    goTo("chat");
  };

  const addNotification = (notif) => {
    setNotifications((prev) => [notif, ...prev]);
    // Optional: open the bell
    // setShowNotifications(true);
  };

  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userSession");
    if (onLogout) onLogout();
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
      case "marketplace":
        return <MarketplaceSection />;

      case "produce":
        return (
          <ProduceSection
            produce={produce}
            onAdd={(item) => setProduce((prev) => [...prev, item])}
            onUpdate={(next) =>
              setProduce((prev) =>
                prev.map((p) => (p.id === next.id ? next : p)),
              )
            }
            onDelete={(id) =>
              setProduce((prev) => prev.filter((p) => p.id !== id))
            }
          />
        );

      case "chat":
        return <ChatSection activeChats={activeChats} />;

      case "workforce":
        return <WorkforceSection />;

      case "scanner":
        return <ScannerSection />;

      case "map":
        return <MapSection produce={produce} />;

      case "credit":
        return <CreditSection />;

      case "schemes":
        return <SchemesSection />;

      case "loans":
        return <LoanSection addNotification={addNotification} />;

      default:
        return <MarketplaceSection />;
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
                  {t("farmer.brand.subtitle")}
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
                    <span className="truncate">{t(item.labelKey)}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* User */}
          <div className="border-t border-gray-100 p-4">
            <button
              onClick={() => setShowProfileModal(true)}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-all"
            >
              <User className="w-6 h-6 text-gray-500" />
              <span className="truncate">{userData.name || t("farmer.profile.nameFallback")}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3 mt-2 rounded-2xl text-base font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-6 h-6 text-red-500" />
              <span>{t("header.logout")}</span>
            </button>
          </div>
        </aside>

        {/* Main */}
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
              {t(NAV_ITEMS.find((n) => n.id === activeSection)?.labelKey)}
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
                      <h3 className="font-bold text-gray-900">{t("farmer.notifications.title")}</h3>
                      {notifications.length > 0 && (
                        <span className="bg-red-100 text-red-600 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full">
                          {notifications.length} {t("farmer.notifications.new")}
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 && (
                        <div className="p-6 text-center text-gray-500 text-sm font-medium">
                          {t("farmer.notifications.none")}
                        </div>
                      )}
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-4 border-b border-gray-50 transition-colors ${notif.type === "order_request" ? "hover:bg-emerald-50/30" : "hover:bg-blue-50/30"}`}
                        >
                          <div className="flex gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === "order_request" ? "bg-emerald-100" : "bg-blue-100"}`}
                            >
                              {notif.type === "order_request" ? (
                                <Package className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Users className="w-5 h-5 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {notif.type === "order_request" ? (
                                  <>
                                    {t("farmer.notifications.retailer")}{" "}
                                    <span className="font-bold text-emerald-700">
                                      {notif.retailerName}
                                    </span>{" "}
                                    {t("farmer.notifications.wantsToBuy")}
                                  </>
                                ) : (
                                  <>
                                    <span className="font-bold text-blue-700">
                                      {notif.applicantName}
                                    </span>{" "}
                                    {t("farmer.notifications.appliedForJob")}
                                  </>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notif.topic}
                              </p>
                              <div className="flex gap-2 mt-3">
                                {notif.type === "order_request" ? (
                                  <button
                                    onClick={() => {
                                      setNotifications((prev) =>
                                        prev.filter((n) => n.id !== notif.id),
                                      );
                                    }}
                                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg shadow-sm font-semibold transition-colors cursor-pointer"
                                  >
                                    {t("farmer.notifications.acceptOrder")}
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
                                    {t("farmer.notifications.viewApplicant")}
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

          {/* Content */}
          <div className="p-6">{renderSection()}</div>

          {/* Chatbot & Notification */}
          <Notification message={notification} />
          <Chatbot />
        </main>

        {/* Profile Modal */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      </div>
  );
}

export default function FarmerPage({ onLogout }) {
  return (
    <LanguageProvider>
      <FarmerPageContent onLogout={onLogout} />
    </LanguageProvider>
  );
}
