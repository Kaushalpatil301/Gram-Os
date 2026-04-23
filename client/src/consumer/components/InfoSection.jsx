import React, { useState } from "react";
import { Flag, Shield, Truck, Star } from "lucide-react";
import { useTranslation } from "../i18n/config";
import ReportIssuePopup from "./ReportIssuePopup";

export default function InfoSection({ onNotification }) {
  const { t } = useTranslation();
  const [isReportPopupOpen, setIsReportPopupOpen] = useState(false);

  const handleReportClick = () => {
    setIsReportPopupOpen(true);
  };

  const handleReportSubmit = () => {
    onNotification(t("report.success"));
  };

  const handleClosePopup = () => {
    setIsReportPopupOpen(false);
  };

  const steps = [
    t("info.step1"),
    t("info.step2"),
    t("info.step3")
  ];

  const features = [
    { icon: Shield, text: t("info.feature1") },
    { icon: Truck, text: t("info.feature2") },
    { icon: Star, text: t("info.feature3") },
  ];

  return (
    <>
      {/* Report Issue */}
      <div className="bg-white rounded-2xl shadow-lg border-1 border-red-400 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-xl">
            <Flag className="h-5 w-5 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t("info.report")}</h3>
        </div>
        <p className="text-gray-600 mb-4">
          {t("info.reportSubtitle")}
        </p>
        <button
          onClick={handleReportClick}
          className="w-full border-2 border-red-300 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
        >
          <Flag className="inline mr-2 h-4 w-4" />
          {t("info.report")}
        </button>
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-4">{t("info.howItWorks")}</h3>
        <div className="space-y-3 text-sm">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {index + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AgriChain Features */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-green-900 mb-4">
          {t("info.features")}
        </h3>
        <div className="space-y-3 text-sm">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <feature.icon className="h-5 w-5 text-green-600" />
              <span>{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Report Issue Popup */}
      <ReportIssuePopup 
        isOpen={isReportPopupOpen} 
        onClose={handleClosePopup}
        onSubmit={handleReportSubmit}
      />
    </>
  );
}
