import React from "react";
import { QrCode, History, Package, CheckCircle } from "lucide-react";

export default function ScanSection({ scanHistory, onScanClick }) {
  return (
    <>
      {/* QR Scanner Card */}
      <div className="bg-white rounded-2xl shadow-lg border-2 border-green-200 p-8 text-center mb-8 hover:shadow-xl transition-shadow">
        <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <QrCode className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Product Scanner
        </h3>
        <p className="text-gray-600 mb-8 text-lg">
          Scan product QR codes to verify authenticity and trace origin
        </p>
        <button
          onClick={onScanClick}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
        >
          <QrCode className="inline mr-3 h-6 w-6" />
          Scan QR Code
        </button>
      </div>

    </>
  );
}
