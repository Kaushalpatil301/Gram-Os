import React from "react";
import { useTranslation } from "../i18n/config";
import ScanSection from "./ScanSection";
import InfoSection from "./InfoSection";

export default function MainContent({ scanHistory, onScanClick, onNotification }) {
  const { t } = useTranslation();

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side - Scan & Recent Scans */}
        <div className="lg:col-span-2">
          <ScanSection 
            scanHistory={scanHistory}
            onScanClick={onScanClick}
          />
        </div>
        
        {/* Right Side - Report, How it Works, Features */}
        <div className="space-y-6">
          <InfoSection onNotification={onNotification} />
        </div>
      </div>
    </main>
  );
}
