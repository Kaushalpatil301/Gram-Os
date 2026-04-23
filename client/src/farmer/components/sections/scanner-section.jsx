import { useState, useEffect } from "react";
import { QrCode, History, Package, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScanModal from "../ScanModal";

export default function ScannerSection() {
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("farmerScanHistory");
    if (saved) setScanHistory(JSON.parse(saved));
  }, []);

  const handleScan = (decodedText) => {
    console.log("Farmer scanned:", decodedText);
    // Extract product ID from URL (handles both full URLs and relative paths)
    const productIdMatch = decodedText.match(/\/product\/([a-zA-Z0-9]+)/);
    if (productIdMatch) {
      const productId = productIdMatch[1];
      console.log("Redirecting to farmer product:", productId);
      window.location.href = `/farmer/product/${productId}`;
      return;
    }
    // If no product ID found, use the URL as-is
    window.location.href = decodedText;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Product QR Scanner
        </h2>
        <p className="text-gray-600">
          Scan product QR codes to verify authenticity and trace origin
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Scan Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-2xl border-2 border-green-200 p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <QrCode className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Product Scanner
              </h3>
              <p className="text-gray-600 mb-8">
                Scan product QR codes to verify authenticity
              </p>
              <button
                onClick={() => setShowScanModal(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl text-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg"
              >
                <QrCode className="inline mr-3 h-6 w-6" />
                Scan QR Code
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <History className="h-5 w-5 text-green-600" />
                </div>
                <CardTitle>Recent Scans</CardTitle>
              </div>
              <span className="text-sm text-gray-500">
                {scanHistory.length} total
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {scanHistory.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  No scans yet. Start by scanning a product QR code!
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {scanHistory.slice(0, 5).map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-green-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {scan.productName}
                      </h4>
                      <p className="text-sm text-gray-600">{scan.origin}</p>
                      <p className="text-xs text-gray-500">{scan.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle
                        className={`h-5 w-5 ${scan.status === "Verified" ? "text-green-500" : "text-yellow-500"}`}
                      />
                      <span
                        className={`text-sm font-medium ${scan.status === "Verified" ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {scan.status === "Verified" ? "Verified" : "Warning"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScanModal
        isVisible={showScanModal}
        onClose={() => setShowScanModal(false)}
        onScan={handleScan}
      />
    </div>
  );
}
