import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import {
  Menu,
  X,
  User,
  LogOut,
  Sprout,
  Leaf,
  Warehouse,
  ShoppingCart,
  HelpCircle,
  BarChart3,
  Map,
  QrCode,
} from "lucide-react";
import { useTranslation } from "../../consumer/i18n/config.jsx";

export default function Navbar({
  onNavigate,
  activeSection,
  onLogout,
  showProfileModal,
  setShowProfileModal,
}) {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { id: "home", label: t("farmer.nav.home"), icon: "Leaf" },
    { id: "produce", label: t("farmer.nav.produce"), icon: "Warehouse" },
    { id: "scanner", label: t("farmer.nav.scanner"), icon: "QrCode" },
    { id: "market", label: t("farmer.nav.localMarket"), icon: "ShoppingCart" },
    { id: "queries", label: t("farmer.nav.queries"), icon: "HelpCircle" },
    { id: "reports", label: t("farmer.nav.reports"), icon: "BarChart3" },
    { id: "map", label: t("farmer.nav.map"), icon: "Map" },
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin);
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const go = (id) => {
    gsap.to(window, {
      duration: 0.8,
      ease: "power2.out",
      scrollTo: { y: `#${id}`, offsetY: 72 },
    });
    onNavigate(id);
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userSession");
    setShowUserMenu(false);
    setTimeout(() => {
      if (onLogout) onLogout();
    }, 500);
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Leaf,
      Warehouse,
      QrCode,
      ShoppingCart,
      HelpCircle,
      BarChart3,
      Map,
    };
    return icons[iconName] || Leaf;
  };

  return (
    <>
      {/* Overlay for mobile menu and user menu */}
      {(showUserMenu || isMobileMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/20 lg:bg-transparent"
          onClick={() => {
            setShowUserMenu(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white shadow-xl transition-all duration-200 ${
          scrolled ? "shadow-2xl" : ""
        }`}
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Sprout className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  AgriChain Farmer
                </h1>
                <p className="text-green-200 text-sm hidden sm:block truncate">
                  Farm Management Portal
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const Icon = getIconComponent(item.icon);
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => go(item.id)}
                    className={`cursor-pointer flex items-center space-x-2 px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white text-green-700 shadow-md font-semibold"
                        : "text-white hover:text-green-100 hover:bg-white/20"
                    }`}
                    aria-label={`Go to ${item.label}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* User Menu & Mobile Toggle */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
                  aria-label="User menu"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                 {showUserMenu && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-50">
                     <div className="px-4 py-2 border-b border-gray-200">
                       <p className="font-medium text-gray-900">
                         {t("farmer.dashboard.title")}
                       </p>
                       <p className="text-xs text-gray-500 truncate">
                         farmer@agricchain.com
                       </p>
                     </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        if (setShowProfileModal) setShowProfileModal(true);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {t("farmer.profileModal.title")}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("header.logout")}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-white/20 transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-green-500/30 py-4">
              <div className="flex flex-col space-y-2">
                {navItems.map((item) => {
                  const Icon = getIconComponent(item.icon);
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "bg-white text-green-700 font-semibold"
                          : "text-white hover:text-green-100 hover:bg-white/20"
                      }`}
                      aria-label={`Go to ${item.label}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
