import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Menu, X, User, LogOut, Leaf,
  AlertTriangle, Briefcase, BookOpen, GraduationCap,
  IndianRupee, QrCode, FileText,
} from "lucide-react";
import { navItems } from "../lib/data";

export default function Navigation({
  activeSection,
  scrollToSection,
  showProfileModal,
  setShowProfileModal,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState(activeSection);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const getIconComponent = (iconName) => {
    const icons = {
      User,
      AlertTriangle,
      Briefcase,
      BookOpen,
      GraduationCap,
      IndianRupee,
      QrCode,
      FileText,
    };
    return icons[iconName] || Leaf;
  };

  // Sync with parent prop
  useEffect(() => {
    setCurrentSection(activeSection);
  }, [activeSection]);

  // Enhanced scroll listener with proper offset
  useEffect(() => {
    const sectionIds = navItems.map((n) => n.id);

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;

      // Check if user is at or near bottom of page
      if (window.pageYOffset + viewportHeight >= scrollHeight - 50) {
        setCurrentSection(sectionIds[sectionIds.length - 1]);
        return;
      }

      // Normal section detection
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
            setCurrentSection(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("villagerProfile");
    localStorage.removeItem("villagerScanHistory");
    localStorage.removeItem("villagerModuleProgress");
    localStorage.removeItem("userSession");
    setShowUserMenu(false);
    setTimeout(() => {
      window.location.href = "/";
    }, 500);
  };

  return (
    <>
      {/* Overlay for menus */}
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
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white shadow-xl"
        role="navigation"
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  GramOS
                </h1>
                <p className="text-green-200 text-sm hidden sm:block truncate">
                  Rural Gig Network
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const Icon = getIconComponent(item.icon);
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
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
                        Villager Dashboard
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        villager@gramos.in
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
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
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
                  const isActive = currentSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        scrollToSection(item.id);
                        setIsMobileMenuOpen(false);
                      }}
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
