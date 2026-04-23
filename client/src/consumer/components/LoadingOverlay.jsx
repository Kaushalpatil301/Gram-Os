import React from "react";
import { useTranslation } from "../i18n/config";

export default function LoadingOverlay({ isVisible }) {
  const { t } = useTranslation();
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-2xl text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
        <p className="text-lg font-semibold text-gray-700">{t("loading.scanningQr")}</p>
      </div>
    </div>
  );
}
