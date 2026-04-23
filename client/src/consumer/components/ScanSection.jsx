import React from "react";
import { QrCode, History, Package, CheckCircle } from "lucide-react";
import { useTranslation } from "../i18n/config";

export default function ScanSection({ scanHistory, onScanClick }) {
  const { t } = useTranslation();

  return (
    <>
      {/* QR Scanner Card */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8 text-center mb-8 hover:shadow-xl transition-shadow">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <QrCode className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">{t("scan.title")}</h3>
        <p className="text-gray-600 mb-8 text-lg">
          {t("scan.subtitle")}
        </p>
        <button
          onClick={onScanClick}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
        >
          <QrCode className="inline mr-3 h-6 w-6" />
          {t("scan.button")}
        </button>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl">
              <History className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{t("scan.history")}</h3>
          </div>
          <span className="text-sm text-gray-500">{scanHistory.length} total</span>
        </div>

        {scanHistory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t("scan.noScans")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scanHistory.slice(0, 5).map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-green-50 cursor-pointer transition-colors">
                <div>
                  <h4 className="font-semibold text-gray-900">{scan.productName}</h4>
                  <p className="text-sm text-gray-600">{scan.origin}</p>
                  <p className="text-xs text-gray-500">{scan.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className={`h-5 w-5 ${scan.status === 'Verified' ? 'text-green-500' : 'text-yellow-500'}`} />
                  <span className={`text-sm font-medium ${scan.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {scan.status === 'Verified' ? t("scan.verified") : t("scan.warning")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
