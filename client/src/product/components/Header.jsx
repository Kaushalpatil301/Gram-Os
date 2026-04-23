"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, LogOut, Leaf, ArrowLeft } from "lucide-react";
import Notification from "./Notification.jsx";

export default function Header({
  onLogout,
  productId = null,
  showBackButton = false,
  title = "AgriChain",
  subtitle = "Farm to Table Transparency",
}) {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notification, setNotification] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("scanHistory");
    localStorage.removeItem("userSession");
    localStorage.removeItem("issueReports");
    setShowUserMenu(false);
    setNotification("Logged out successfully ✅");
    setTimeout(() => {
      if (onLogout) onLogout();
      window.location.href = "/";
    }, 1500);
  };

  const handleBackNavigation = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard/consumer");
    }
  };

  return (
    <>
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-xl border-b border-green-500">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <button
                  onClick={handleBackNavigation}
                  className="p-3  cursor-pointer  rounded-xl hover:bg-white/25 transition-all duration-200 hover:scale-125"
                  title="Go back"
                >
                  <ArrowLeft className="h-7 w-7" />
                </button>
              )}



              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                <p className="text-green-100 text-sm font-medium">{subtitle}</p>
                {productId && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-green-200">Product ID:</span>
                    <code className="text-xs font-mono bg-green-500/20 px-2 py-1 rounded text-green-100">
                      {productId.slice(0, 8)}...
                    </code>
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-3 rounded-xl hover:bg-white/15 transition-all duration-200 hover:scale-105"
              >
                <User className="h-6 w-6" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-gray-900">
                      Consumer Portal
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      demo@agricchain.com
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}

      <Notification message={notification} />
    </>
  );
}
