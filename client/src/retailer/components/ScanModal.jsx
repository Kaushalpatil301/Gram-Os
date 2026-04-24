import React, { useState, useEffect, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import QrScanner from "qr-scanner";
import { useTranslation } from "../../consumer/i18n/config.jsx";

export default function ScanModal({ isVisible, onClose, onScan }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (mode === "camera" && isVisible) {
      const scanner = new Html5Qrcode("camera-preview");
      scannerRef.current = scanner;

      scanner
        .start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            scanner.stop();
            onScan(decodedText);
            setMode(null);
          },
        )
        .catch((err) => {
          console.error("Failed to start camera:", err);
          alert(t("qr.cameraError"));
          setMode(null);
        });

      return () => {
        if (scanner.isScanning) {
          scanner.stop().catch(console.error);
        }
      };
    }
  }, [mode, isVisible, onScan]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const qrResult = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      if (qrResult?.data) {
        onScan(qrResult.data);
      } else {
        alert(t("qr.noCodeImage"));
      }
    } catch (err) {
      console.error("QR scan error:", err);
      alert(t("qr.noCodeImage"));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl relative">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">
            {t("qr.modalTitle")}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!mode && (
            <>
              <button
                onClick={() => setMode("camera")}
                className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                <Camera className="mr-3 h-5 w-5" />
                {t("qr.scanWithCamera")}
              </button>
              <label className="w-full border-2 border-green-300 text-green-700 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors flex items-center justify-center cursor-pointer">
                <Upload className="mr-3 h-5 w-5" />
                {t("qr.uploadImage")}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </>
          )}

          {mode === "camera" && (
            <div>
              <div
                id="camera-preview"
                className="w-full h-64 bg-gray-200 rounded-lg"
              ></div>
              <button
                onClick={() => setMode(null)}
                className="mt-4 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                {t("qr.cancel")}
              </button>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <p className="text-sm text-gray-500 text-center">
            {mode ? t("qr.scanning") : t("qr.chooseMethod")}
          </p>
        </div>
      </div>
    </div>
  );
}
