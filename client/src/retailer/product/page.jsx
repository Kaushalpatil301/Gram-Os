"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { loadRazorpay } from "../../lib/razorpay";
import Header from "../../product/components/Header.jsx";
import Footer from "../../product/components/Footer.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";
import { LanguageProvider, useTranslation } from "../../consumer/i18n/config.jsx";
import { apiLogout } from "../../lib/api.js";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/products";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Razorpay loader is now handled via shared utility


// ─── Fallback mock product (when API is offline) ──────────────────────────
const MOCK_PRODUCT = {
  _id: "PROD-2024-0847",
  name: "Alphonso Mangoes",
  type: "Fruit",
  locality: "Ratnagiri, Maharashtra",
  quantity: 280,
  basePrice: 120,
  status: "active",
  farmerName: "Ganesh Patil",
  farmerEmail: "ganesh.patil@konkanfarm.in",
  farmerPhone: "+91 98765 43210",
  farmId: "FARM-KON-2241",
  farmLocation: "Ratnagiri, Konkan Coast",
  farmerRating: 4.9,
  farmSize: "8.5 Acres",
  yearsOfExperience: 22,
  certification: "✓ GI Tag Certified (Hapus)",
  description:
    "Third-generation mango farmer specialising in authentic Hapus Alphonso. Uses traditional drip irrigation and zero synthetic pesticides. Winner of Maharashtra State Best Farmer Award 2022.",
  createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  journey: [
    {
      stage: "Harvested",
      location: "Ratnagiri Farm",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      detail: "Hand-picked at optimal ripeness, GI-certified batch",
    },
    {
      stage: "Quality Checked",
      location: "APMC Ratnagiri",
      timestamp: new Date(Date.now() - 40 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      detail: "Grade A certified — 9.2/10 freshness score",
    },
    {
      stage: "Cold Storage",
      location: "Chiplun Cold Chain Hub",
      timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      detail: "Stored at 12°C, humidity 85%",
    },
    {
      stage: "In Transit",
      location: "NH66 — Chiplun to Mumbai",
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      status: "completed",
      detail: "Refrigerated truck, temp-monitored",
    },
    {
      stage: "At Your Store",
      location: "Retailer Warehouse, Bhayandar",
      timestamp: new Date().toISOString(),
      status: "current",
      detail: "Ready for purchase & shelf",
    },
    {
      stage: "Consumer",
      location: "End Customer",
      timestamp: null,
      status: "pending",
      detail: "Final destination",
    },
  ],
};

function RetailerProductPageInner({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [notification, setNotification] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // AI profit analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // Purchase quantity & payment
  const [purchaseQty, setPurchaseQty] = useState(50);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Add to inventory state
  const [addedToInventory, setAddedToInventory] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Auto-trigger AI analysis once product loads
  useEffect(() => {
    if (currentProduct) fetchAiAnalysis(currentProduct);
  }, [currentProduct]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      if (id) {
        const response = await axios.get(`${API_URL}/${id}`);
        const product = response.data.data.product;
        setCurrentProduct(product);
        setNotification(`✅ QR Scanned: ${product.name}`);
      } else {
        setCurrentProduct(MOCK_PRODUCT);
        setNotification("✅ QR Scanned: Alphonso Mangoes (demo)");
      }
    } catch (err) {
      // Fallback to mock data
      setCurrentProduct(MOCK_PRODUCT);
      setNotification("✅ QR Scanned: Alphonso Mangoes (demo)");
    } finally {
      setLoading(false);
    }
  };

  // ─── AI Profit Analysis via Backend ─────────────────────────────────
  const fetchAiAnalysis = async (product) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await axios.post(`${API_URL}/${product._id}/analyze-profit`);
      setAiAnalysis(response.data.data.analysis);
    } catch (err) {
      console.error("AI Analysis Error:", err);
      // Fallback static analysis
      setAiAnalysis({
        buyRecommendation: "STRONG BUY",
        recommendedBuyQty: 150,
        estimatedRetailPrice: 160,
        estimatedProfitPerKg: 40,
        estimatedTotalProfit: 6000,
        profitMarginPercent: 33.3,
        demandLevel: "Very High",
        peakSellWindow: "Next 3–4 days",
        spoilageRisk: "Low",
        competitorPrice: 175,
        priceAdvantage: 15,
        whyBuy: [
          "AI analysis failed to load properly. Displaying default static data.",
          "Check backend connection."
        ],
        risks: [
          "Shelf life window is limited.",
        ],
        storageAdvice: "Store at optimal temperature.",
        aiConfidence: 50,
      });
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Razorpay Payment ──────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    const loaded = await loadRazorpay();
    if (!loaded) {
      setNotification("❌ Razorpay failed to load. Check your connection.");
      setPaymentLoading(false);
      return;
    }

    const totalAmount = purchaseQty * (currentProduct?.basePrice || 120);
    const gst = Math.round(totalAmount * 0.05);
    const grandTotal = totalAmount + gst;

    const options = {
      key: "rzp_test_SbpLusWieguIBI", // Replace with your Razorpay test/live key
      amount: grandTotal * 100, 
      currency: "INR",
      name: "AgriChain Retailer Portal",
      description: `Purchase: ${purchaseQty} kg ${currentProduct?.name}`,
      image: "https://i.ibb.co/your-logo", // optional
      handler: function (response) {
        setPaymentSuccess(true);
        setNotification(
          `✅ Payment of ₹${grandTotal.toLocaleString()} successful! Ref: ${response.razorpay_payment_id}`
        );
        setPaymentLoading(false);
      },
      prefill: {
        name: "Retailer",
        email: localStorage.getItem("userEmail") || "retailer@agrichain.com",
        contact: "9999999999",
      },
      notes: {
        product: currentProduct?.name,
        farmer: currentProduct?.farmerName,
        quantity: `${purchaseQty} kg`,
        farmId: currentProduct?.farmId,
      },
      theme: { color: "#059669" },
      modal: {
        ondismiss: () => {
          setNotification("⚠️ Payment cancelled.");
          setPaymentLoading(false);
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setNotification(`❌ Payment failed: ${response.error.description}`);
      setPaymentLoading(false);
    });
    rzp.open();
  };

  const handleAddToInventory = () => {
    setAddedToInventory(true);
    setNotification(`✅ ${purchaseQty} kg ${currentProduct?.name} added to inventory!`);
  };

  const handleLogoutWithNotification = async () => {
    setNotification("Logged out successfully ✅");
    await apiLogout();
    if (onLogout) onLogout();
  };

  const getBadgeColor = (rec) => {
    if (rec === "STRONG BUY") return "bg-green-100 text-green-800 border-green-300";
    if (rec === "BUY") return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (rec === "HOLD") return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getDemandColor = (level) => {
    if (level === "Very High") return "text-green-600";
    if (level === "High") return "text-emerald-600";
    if (level === "Medium") return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (risk) => {
    if (risk === "Low") return "text-green-600 bg-green-50 border-green-200";
    if (risk === "Medium") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">{t("retailer.product.loadingTitle")}</h3>
          <p className="text-green-600">{t("retailer.product.loadingSubtitle")}</p>
          {id && (
            <p className="text-sm text-gray-600 mt-3 font-mono bg-white px-3 py-1 rounded-full inline-block">
              {t("common.id")}: {id}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error && !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">{error}</h3>
          <p className="text-gray-600 mb-4">{t("retailer.product.checkProductId")}</p>
          <button
            onClick={() => navigate("/dashboard/retailer")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            {t("retailer.product.goDashboard")}
          </button>
        </div>
      </div>
    );
  }

  const totalCost = purchaseQty * (currentProduct?.basePrice || 0);
  const gstAmount = Math.round(totalCost * 0.05);
  const grandTotal = totalCost + gstAmount;
  const estimatedRevenue = aiAnalysis
    ? purchaseQty * aiAnalysis.estimatedRetailPrice
    : 0;
  const estimatedProfit = aiAnalysis
    ? purchaseQty * aiAnalysis.estimatedProfitPerKg
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      <Header
        onLogout={handleLogoutWithNotification}
        productId={id}
        showBackButton={true}
        title={t("retailer.product.portalTitle")}
        subtitle={t("retailer.product.portalSubtitle")}
      />

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Main Product Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Product Image and Basic Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="relative aspect-video bg-gradient-to-br from-emerald-100 to-green-200 overflow-hidden">
                {currentProduct?.image ? (
                  <img
                    src={currentProduct.image}
                    alt={currentProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-8xl">🥭</span>
                  </div>
                )}
                {/* Journey badge overlay */}
                <div className="absolute top-4 left-4 bg-white/90 rounded-full px-3 py-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                  {t("retailer.product.fullJourney")}
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                      {currentProduct?.name}
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center gap-2">
                      <span className="text-2xl">📍</span>
                      {currentProduct?.locality}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${
                      currentProduct?.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {currentProduct?.status === "active" ? t("retailer.product.fresh") : t("retailer.product.notAvailable")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t("retailer.product.type")}</p>
                    <p className="text-lg font-bold text-gray-900">{currentProduct?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t("retailer.product.availableQty")}</p>
                    <p className="text-lg font-bold text-green-600">{currentProduct?.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t("retailer.product.harvestDate")}</p>
                    <p className="text-lg font-bold text-gray-900">
                      {currentProduct?.harvestDate
                        ? new Date(currentProduct.harvestDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : t("retailer.product.recentlyHarvested")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t("retailer.product.certification")}</p>
                    <p className="text-base font-bold text-emerald-700">{currentProduct?.certification || t("retailer.product.organicCertified")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Pricing Panel */}
          <div className="space-y-6">
            {/* Freshness Score */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{t("retailer.product.freshnessScore")}</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-green-600">9.2</span>
                <span className="text-gray-500">/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
              <p className="text-sm text-green-600 font-medium mt-3">{t("retailer.product.excellentQuality")}</p>
            </div>

            {/* Listing Date */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t("retailer.product.scannedAt")}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                Listed{" "}
                {currentProduct?.createdAt
                  ? `${Math.floor((Date.now() - new Date(currentProduct.createdAt)) / 3600000)} hours ago`
                  : t("retailer.product.recently")}
              </p>
            </div>

            {/* Market Price */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">📊 {t("retailer.product.marketPrice")}</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">{t("retailer.product.farmerPrice")}</p>
                  <p className="text-3xl font-bold text-emerald-600">₹{currentProduct?.basePrice}/kg</p>
                </div>
                {aiAnalysis && (
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("retailer.product.marketRate")}</span>
                      <span className="font-semibold text-gray-500 line-through">₹{aiAnalysis.competitorPrice}/kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{t("retailer.product.youSave")}</span>
                      <span className="font-bold text-green-700">₹{aiAnalysis.priceAdvantage}/kg</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">{t("retailer.product.belowMarket")}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SIMPLIFIED TRANSPORT PLAN ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🚚 {t("retailer.product.transportPlan")}
          </h2>
          <p className="text-gray-500 mb-6">{t("retailer.product.transportSubtitle")}</p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map/Routing Visual */}
            <div className="relative">
              <div className="absolute left-6 top-8 bottom-8 w-0.5 border-l-2 border-dashed border-blue-300 z-0"></div>
              
              <div className="space-y-8 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 border-4 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    🧑‍🌾
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t("retailer.product.pickupLocation")}</p>
                    <p className="font-bold text-gray-900">{currentProduct?.farmLocation || currentProduct?.locality}</p>
                    <p className="text-sm text-gray-600">{t("retailer.product.farmOf", { name: currentProduct?.farmerName })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    🛣️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase">{t("retailer.product.inTransit")}</p>
                    <p className="font-bold text-gray-900">{t("retailer.product.logisticsPartner")}</p>
                    <p className="text-sm text-gray-600">{t("retailer.product.refrigeratedTruck")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 border-4 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    🏪
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">{t("retailer.product.dropLocation")}</p>
                    <p className="font-bold text-gray-900">{t("retailer.product.yourRetailStore")}</p>
                    <p className="text-sm text-gray-600">{t("retailer.product.directUnloading")}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Options & Cost */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{t("retailer.product.sharedTrucking")}</h3>
                    <p className="text-sm text-gray-600">{t("retailer.product.costEffective")}</p>
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">{t("retailer.product.recommended")}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">{t("retailer.product.estimatedCost")}</p>
                    <p className="text-lg font-bold text-gray-900">₹850 - ₹1,200</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">{t("retailer.product.deliveryTime")}</p>
                    <p className="text-lg font-bold text-gray-900">{t("retailer.product.within24h")}</p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm">
                  {t("retailer.product.addTransport")}
                </button>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">{t("retailer.product.bookDedicated")}</h3>
                    <p className="text-sm text-gray-600">{t("retailer.product.fasterDelivery")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">~ ₹2,500</p>
                    <p className="text-xs text-gray-500">{t("retailer.product.sameDay")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── AI PROFIT ANALYSIS ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🤖</div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{t("retailer.product.aiProfitAnalysis")}</h2>
              <p className="text-sm text-gray-500">{t("retailer.product.aiTake")}</p>
            </div>
            {aiAnalysis && (
              <div className="ml-auto flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full font-bold text-sm border ${getBadgeColor(aiAnalysis.buyRecommendation)}`}>
                  {aiAnalysis.buyRecommendation}
                </span>
                <span className="text-xs text-gray-400">{t("retailer.product.aiConfidence", { value: aiAnalysis.aiConfidence })}</span>
              </div>
            )}
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
              <p className="text-purple-600 font-medium">{t("retailer.product.aiAnalyzing")}</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              {/* Profit KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-1">{t("retailer.product.retailPrice")}</p>
                  <p className="text-2xl font-bold text-green-700">₹{aiAnalysis.estimatedRetailPrice}/kg</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">{t("retailer.product.profitPerKg")}</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{aiAnalysis.estimatedProfitPerKg}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">{t("retailer.product.margin")}</p>
                  <p className="text-2xl font-bold text-blue-700">{aiAnalysis.profitMarginPercent.toFixed(1)}%</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                  <p className="text-xs text-purple-600 font-semibold uppercase mb-1">{t("retailer.product.demand")}</p>
                  <p className={`text-xl font-bold ${getDemandColor(aiAnalysis.demandLevel)}`}>
                    {aiAnalysis.demandLevel}
                  </p>
                </div>
              </div>

              {/* Additional insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">{t("retailer.product.sellWindow")}</p>
                  <p className="text-lg font-bold text-gray-800">⏱ {aiAnalysis.peakSellWindow}</p>
                </div>
                <div className={`rounded-xl p-4 border ${getRiskColor(aiAnalysis.spoilageRisk)}`}>
                  <p className="text-xs font-semibold uppercase mb-2">{t("retailer.product.spoilageRisk")}</p>
                  <p className="text-lg font-bold">⚠️ {aiAnalysis.spoilageRisk}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">{t("retailer.product.aiRecommends")}</p>
                  <p className="text-lg font-bold text-gray-800">📦 {aiAnalysis.recommendedBuyQty} kg</p>
                </div>
              </div>

              {/* Why Buy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-green-700 mb-3">✅ {t("retailer.product.whyBuy")}</p>
                  <ul className="space-y-2">
                    {aiAnalysis.whyBuy.map((reason, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-100">
                        <span className="text-green-500 mt-0.5">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-bold text-red-600 mb-3">⚠️ {t("retailer.product.risks")}</p>
                  <ul className="space-y-2">
                    {aiAnalysis.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-red-400 mt-0.5">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">🧊 {t("retailer.product.storageAdvice")}</p>
                    <p className="text-sm text-gray-700">{aiAnalysis.storageAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic profit preview tied to purchase quantity */}
              <div className="bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-5 border border-purple-200">
                <p className="text-sm font-bold text-purple-700 mb-3">📊 {t("retailer.product.profitPreview")}</p>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <label className="text-sm text-gray-600 font-semibold">{t("retailer.product.quantity")}</label>
                  <input
                    type="range"
                    min="10"
                    max={currentProduct?.quantity || 280}
                    step="10"
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(Number(e.target.value))}
                    className="w-48 accent-emerald-600"
                  />
                  <span className="text-lg font-bold text-emerald-700">{purchaseQty} kg</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">{t("retailer.product.youPayInclGst")}</p>
                    <p className="text-xl font-bold text-gray-800">₹{grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">{t("retailer.product.expectedRevenue")}</p>
                    <p className="text-xl font-bold text-blue-700">₹{estimatedRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">{t("retailer.product.estimatedProfit")}</p>
                    <p className="text-xl font-bold text-green-700">₹{estimatedProfit.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">{t("retailer.product.margin")}</p>
                    <p className="text-xl font-bold text-emerald-700">{aiAnalysis.profitMarginPercent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("retailer.product.aiUnavailable")} <button onClick={() => fetchAiAnalysis(currentProduct)} className="text-purple-600 underline">{t("common.retry")}</button>
            </div>
          )}
        </div>

        {/* ─── PURCHASE & PAYMENT GATEWAY ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-emerald-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🛒 {t("retailer.product.purchasePayment")}
          </h2>

          {paymentSuccess ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">{t("retailer.product.paymentSuccessful")}</h3>
              <p className="text-gray-600 mb-4">
                {t("retailer.product.purchaseSuccessLine", {
                  qty: purchaseQty,
                  name: currentProduct?.name,
                  total: grandTotal.toLocaleString(),
                })}
              </p>
              <button
                onClick={handleAddToInventory}
                disabled={addedToInventory}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  addedToInventory
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {addedToInventory ? `✓ ${t("retailer.product.addedInventory")}` : `✓ ${t("retailer.product.addInventory")}`}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-3">{t("retailer.product.orderSummary")}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentProduct?.name} × {purchaseQty} kg</span>
                    <span className="font-semibold">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>{t("retailer.product.gst5")}</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>{t("contracts.total")}</span>
                    <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                {aiAnalysis && (
                  <div className="mt-3 text-xs text-green-600 font-medium bg-green-50 rounded-lg px-3 py-2">
                    💰 {t("retailer.product.estimatedProfitAfterSale", {
                      profit: estimatedProfit.toLocaleString(),
                      margin: aiAnalysis.profitMarginPercent.toFixed(1),
                    })}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paymentLoading}
                  className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {paymentLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full"></div>
                      {t("retailer.product.processing")}
                    </>
                  ) : (
                    <>💳 {t("retailer.product.payViaRazorpay", { total: grandTotal.toLocaleString() })}</>
                  )}
                </button>
                <button
                  onClick={handleAddToInventory}
                  disabled={addedToInventory}
                  className={`flex-1 min-w-[200px] font-semibold py-3 px-6 rounded-lg transition-colors ${
                    addedToInventory
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {addedToInventory ? `✓ ${t("retailer.product.addedInventory")}` : `✓ ${t("retailer.product.acceptAddInventory")}`}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                {t("retailer.product.paymentSecurityLine")}
              </p>
            </div>
          )}
        </div>

        {/* ─── FARMER DETAILS ──────────────────────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">👨‍🌾 {t("retailer.product.farmerInfo")}</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: t("retailer.product.farmerName"), value: currentProduct?.farmerName || t("retailer.product.na"), border: "border-green-600" },
                { label: t("retailer.product.farmerEmail"), value: currentProduct?.farmerEmail || t("retailer.product.na"), border: "border-green-600", mono: false },
                { label: t("retailer.product.contact"), value: currentProduct?.farmerPhone || t("retailer.product.na"), border: "border-green-600" },
                { label: t("retailer.product.farmId"), value: currentProduct?.farmId || t("retailer.product.na"), border: "border-emerald-600", mono: true },
                { label: t("retailer.product.farmLocation"), value: currentProduct?.farmLocation || currentProduct?.locality || t("retailer.product.na"), border: "border-emerald-600" },
                { label: t("retailer.product.farmSize"), value: currentProduct?.farmSize || t("retailer.product.na"), border: "border-lime-600" },
                { label: t("retailer.product.experience"), value: t("retailer.product.experienceYears", { years: currentProduct?.yearsOfExperience || t("retailer.product.na") }), border: "border-lime-600" },
                { label: t("retailer.product.certification"), value: currentProduct?.certification || t("retailer.product.organicCertified"), border: "border-lime-600" },
              ].map((item) => (
                <div key={item.label} className={`border-l-4 ${item.border} pl-4`}>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{item.label}</p>
                  <p className={`text-lg font-bold text-gray-900 ${item.mono ? "font-mono text-sm bg-gray-100 p-2 rounded" : ""}`}>
                    {item.value}
                  </p>
                </div>
              ))}

              {/* Farmer Rating */}
              <div className="border-l-4 border-emerald-600 pl-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{t("retailer.product.farmerRating")}</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-500">{currentProduct?.farmerRating || "4.9"}</span>
                  <span className="text-yellow-500">{"⭐".repeat(Math.round(currentProduct?.farmerRating || 4.9))}</span>
                </div>
              </div>
            </div>

            {(currentProduct?.description || currentProduct?.farmerBio) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">{t("retailer.product.aboutFarmer")}</p>
                <p className="text-gray-700 leading-relaxed">
                  {currentProduct?.farmerBio || currentProduct?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── PRODUCT QUALITY & SHELF LIFE ────────────────────────────── */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 {t("retailer.product.qualityOverTime")}</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">{t("retailer.product.freshnessTimeline")}</p>
                <div className="space-y-3">
                  {[
                    { label: t("retailer.product.days1to3"), pct: 100, color: "bg-green-500", text: "text-green-600" },
                    { label: t("retailer.product.days4to7"), pct: 75, color: "bg-yellow-500", text: "text-yellow-600" },
                    { label: t("retailer.product.days8to12"), pct: 50, color: "bg-orange-500", text: "text-orange-600" },
                    { label: t("retailer.product.days13plus"), pct: 25, color: "bg-red-500", text: "text-red-600" },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{row.label}</span>
                        <span className={`text-sm font-bold ${row.text}`}>{row.pct}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`${row.color} h-3 rounded-full`} style={{ width: `${row.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-8">
                <p className="text-sm font-semibold text-gray-700 mb-4">{t("retailer.product.qualityMetrics")}</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t("retailer.product.colorQuality"), value: t("retailer.product.excellent"), pct: 95 },
                    { label: t("retailer.product.textureQuality"), value: t("retailer.product.excellent"), pct: 92 },
                    { label: t("retailer.product.smellQuality"), value: t("retailer.product.excellent"), pct: 90 },
                    { label: t("retailer.product.ripenessLevel"), value: t("retailer.product.perfect"), pct: 88 },
                  ].map((m) => (
                    <div key={m.label} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <p className="text-xs font-semibold text-green-700 uppercase mb-2">{m.label}</p>
                      <div className="text-2xl font-bold text-green-600 mb-2">{m.value}</div>
                      <div className="bg-white rounded h-2">
                        <div className="bg-green-500 h-2 rounded" style={{ width: `${m.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SHELF LIFE TIPS ─────────────────────────────────────────── */}
        <div className="mt-12 mb-12">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-8 border-2 border-blue-200">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⏱️</span>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{t("retailer.product.shelfLifeStorage")}</h3>
                <div className="space-y-3">
                  {[
                    { icon: "bg-blue-600", symbol: "✓", text: <><strong>{t("retailer.product.optimalUse")}:</strong> {t("retailer.product.optimalUseDesc")}</> },
                    { icon: "bg-yellow-600", symbol: "!", text: <><strong>{t("retailer.product.goodQuality")}:</strong> {t("retailer.product.goodQualityDesc")}</> },
                    { icon: "bg-red-600", symbol: "✕", text: <><strong>{t("retailer.product.notRecommended")}:</strong> {t("retailer.product.notRecommendedDesc")}</> },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 ${item.icon} text-white rounded-full text-sm font-bold`}>
                        {item.symbol}
                      </span>
                      <span className="text-gray-700">{item.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-4 bg-white rounded-lg border-l-4 border-blue-600">
                  <p className="text-sm font-semibold text-gray-900 mb-2">{t("retailer.product.storageTips")}:</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-2">
                    <li>• {t("retailer.product.tip1")}</li>
                    <li>• {t("retailer.product.tip2")}</li>
                    <li>• {t("retailer.product.tip3")}</li>
                    <li>• {t("retailer.product.tip4")}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Chatbot />
      <Footer />
      <Notification message={notification} />
    </div>
  );
}

export default function RetailerProductPage(props) {
  return (
    <LanguageProvider>
      <RetailerProductPageInner {...props} />
    </LanguageProvider>
  );
}