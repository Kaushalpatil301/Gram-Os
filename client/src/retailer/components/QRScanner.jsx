import { useState, useEffect } from "react";
import ScanModal from "./ScanModal";
import ScanSection from "./ScanSection";
import { useTranslation } from "../../consumer/i18n/config.jsx";

export default function QRScanner() {
  const { t } = useTranslation();
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("retailerScanHistory");
    if (saved) setScanHistory(JSON.parse(saved));
  }, []);

  const handleScan = (decodedText) => {
    console.log("Retailer scanned:", decodedText);
    // Extract product ID from URL (handles both full URLs and relative paths)
    const productIdMatch = decodedText.match(/\/product\/([a-zA-Z0-9]+)/);
    if (productIdMatch) {
      const productId = productIdMatch[1];
      console.log("Redirecting to retailer product:", productId);
      window.location.href = `/retailer/product/${productId}`;
      return;
    }
    // If no product ID found, use the URL as-is
    window.location.href = decodedText;
  };

  return (
    <section
      id="qr"
      className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-green-100"
      style={{ scrollMarginTop: "30px" }}
    >
      <div className="p-6 md:p-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            {t("qr.title")}
          </h2>
          <p className="text-gray-600">{t("qr.subtitle")}</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <ScanSection
            scanHistory={scanHistory}
            onScanClick={() => setShowScanModal(true)}
          />
        </div>

        <ScanModal
          isVisible={showScanModal}
          onClose={() => setShowScanModal(false)}
          onScan={handleScan}
        />
      </div>
    </section>
  );
}
