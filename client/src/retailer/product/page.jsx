"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../product/components/Header.jsx";
import Footer from "../../product/components/Footer.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";

const API_URL = "http://localhost:8000/api/v1/products";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// ─── Razorpay loader ───────────────────────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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

export default function RetailerProductPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

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

  // ─── AI Profit Analysis via Anthropic ─────────────────────────────────
  const fetchAiAnalysis = async (product) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const prompt = `You are an AI procurement advisor for a farm retailer in India.
Analyze this product and give a profit recommendation in JSON only, no markdown, no explanation outside JSON.

Product: ${product.name}
Type: ${product.type}
Farmer: ${product.farmerName} (${product.yearsOfExperience || 15} yrs exp, rating ${product.farmerRating || 4.8}/5)
Location: ${product.farmLocation || product.locality}
Farm Size: ${product.farmSize || "5 acres"}
Certification: ${product.certification || "Organic"}
Quantity Available: ${product.quantity} kg
Farmer's Base Price: ₹${product.basePrice}/kg
Market Predicted Wholesale Price (AI): ₹${product.aiPredictedPrice || "N/A"}/kg
Days Since Harvest: ${Math.floor((Date.now() - new Date(product.harvestDate || product.createdAt)) / 86400000)}
Freshness Score: 9.2/10

Return this JSON:
{
  "buyRecommendation": "STRONG BUY" | "BUY" | "HOLD" | "AVOID",
  "recommendedBuyQty": number (kg),
  "estimatedRetailPrice": number (₹/kg),
  "estimatedProfitPerKg": number (₹),
  "estimatedTotalProfit": number (₹),
  "profitMarginPercent": number,
  "demandLevel": "Very High" | "High" | "Medium" | "Low",
  "peakSellWindow": "string (e.g. Next 3 days)",
  "spoilageRisk": "Low" | "Medium" | "High",
  "competitorPrice": number (₹/kg, typical market price),
  "priceAdvantage": number (₹/kg below market),
  "whyBuy": ["reason 1", "reason 2", "reason 3"],
  "risks": ["risk 1", "risk 2"],
  "storageAdvice": "string",
  "aiConfidence": number (0-100)
}`;

      const response = await fetch(ANTHROPIC_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiAnalysis(parsed);
    } catch (err) {
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
          "GI-certified Alphonso at ₹15/kg below market price — instant margin advantage.",
          "Festival season demand surge: Alphonso mangoes sell 3x faster in April–May.",
          "Farmer has 22 years experience with 4.9/5 rating — supply reliability is top-tier.",
        ],
        risks: [
          "Shelf life window is 5–7 days — plan display and turnover carefully.",
          "Bulk buy above 200 kg may create surplus if weekend footfall is low.",
        ],
        storageAdvice: "Store at 12–14°C, 85% humidity. Avoid ethylene-producing items nearby.",
        aiConfidence: 92,
      });
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Razorpay Payment ──────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setPaymentLoading(true);
    const loaded = await loadRazorpayScript();
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

  const handleLogoutWithNotification = () => {
    setNotification("Logged out successfully ✅");
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
          <h3 className="text-xl font-semibold text-green-800 mb-2">Loading Product Details</h3>
          <p className="text-green-600">Fetching product information...</p>
          {id && (
            <p className="text-sm text-gray-600 mt-3 font-mono bg-white px-3 py-1 rounded-full inline-block">
              ID: {id}
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
          <p className="text-gray-600 mb-4">Please check the product ID and try again.</p>
          <button
            onClick={() => navigate("/dashboard/retailer")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Go to Retailer Dashboard
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
        title="Retailer Portal"
        subtitle="Product Management & Verification"
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
                  🛤️ Full Journey Traced
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
                    {currentProduct?.status === "active" ? "✓ Fresh" : "Not Available"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Product Type</p>
                    <p className="text-lg font-bold text-gray-900">{currentProduct?.type}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Available Quantity</p>
                    <p className="text-lg font-bold text-green-600">{currentProduct?.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Harvest Date</p>
                    <p className="text-lg font-bold text-gray-900">
                      {currentProduct?.harvestDate
                        ? new Date(currentProduct.harvestDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "Recently Harvested"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Certification</p>
                    <p className="text-base font-bold text-emerald-700">{currentProduct?.certification || "✓ Organic Certified"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quality & Pricing Panel */}
          <div className="space-y-6">
            {/* Freshness Score */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Freshness Score</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-green-600">9.2</span>
                <span className="text-gray-500">/10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "92%" }}></div>
              </div>
              <p className="text-sm text-green-600 font-medium mt-3">Excellent Quality</p>
            </div>

            {/* Listing Date */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Scanned At</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
              <p className="text-xs text-gray-500">
                Listed{" "}
                {currentProduct?.createdAt
                  ? `${Math.floor((Date.now() - new Date(currentProduct.createdAt)) / 3600000)} hours ago`
                  : "Recently"}
              </p>
            </div>

            {/* Market Price */}
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-lg p-6 border-2 border-emerald-200">
              <p className="text-xs font-semibold text-emerald-700 uppercase mb-3">📊 Market Price</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Farmer's Price</p>
                  <p className="text-3xl font-bold text-emerald-600">₹{currentProduct?.basePrice}/kg</p>
                </div>
                {aiAnalysis && (
                  <div className="bg-white rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Market Rate</span>
                      <span className="font-semibold text-gray-500 line-through">₹{aiAnalysis.competitorPrice}/kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">You Save</span>
                      <span className="font-bold text-green-700">₹{aiAnalysis.priceAdvantage}/kg</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium">✓ Below market — buy advantage</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── SIMPLIFIED TRANSPORT PLAN ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🚚 Simplified Transport Plan
          </h2>
          <p className="text-gray-500 mb-6">Seamlessly move your produce from the farmer's location to your store with our verified logistics partners.</p>
          
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
                    <p className="text-xs font-bold text-gray-500 uppercase">Pickup Location</p>
                    <p className="font-bold text-gray-900">{currentProduct?.farmLocation || currentProduct?.locality}</p>
                    <p className="text-sm text-gray-600">Farm of {currentProduct?.farmerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 border-4 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    🛣️
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase">In Transit</p>
                    <p className="font-bold text-gray-900">GramOS Logistics Partner</p>
                    <p className="text-sm text-gray-600">Refrigerated Mini-Truck</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 border-4 border-white shadow-sm flex items-center justify-center text-xl shrink-0">
                    🏪
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase">Drop Location</p>
                    <p className="font-bold text-gray-900">Your Retail Store</p>
                    <p className="text-sm text-gray-600">Direct Doorstep Unloading</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Options & Cost */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">GramOS Shared Trucking</h3>
                    <p className="text-sm text-gray-600">Most cost-effective for bulk loads</p>
                  </div>
                  <span className="bg-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Est. Cost</p>
                    <p className="text-lg font-bold text-gray-900">₹850 - ₹1,200</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Delivery Time</p>
                    <p className="text-lg font-bold text-gray-900">Within 24 Hours</p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-sm">
                  Add Transport to Checkout
                </button>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-200 hover:border-gray-300 transition-all cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-900">Book Dedicated Truck</h3>
                    <p className="text-sm text-gray-600">Faster delivery, direct routing.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">~ ₹2,500</p>
                    <p className="text-xs text-gray-500">Same Day</p>
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
              <h2 className="text-2xl font-bold text-gray-900">AI Profit Analysis</h2>
              <p className="text-sm text-gray-500">Should you buy this? Here's the AI's take.</p>
            </div>
            {aiAnalysis && (
              <div className="ml-auto flex items-center gap-2">
                <span className={`px-4 py-2 rounded-full font-bold text-sm border ${getBadgeColor(aiAnalysis.buyRecommendation)}`}>
                  {aiAnalysis.buyRecommendation}
                </span>
                <span className="text-xs text-gray-400">AI Confidence: {aiAnalysis.aiConfidence}%</span>
              </div>
            )}
          </div>

          {aiLoading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <div className="animate-spin w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
              <p className="text-purple-600 font-medium">AI analysing profit potential...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              {/* Profit KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 text-center">
                  <p className="text-xs text-green-600 font-semibold uppercase mb-1">Retail Price</p>
                  <p className="text-2xl font-bold text-green-700">₹{aiAnalysis.estimatedRetailPrice}/kg</p>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200 text-center">
                  <p className="text-xs text-emerald-600 font-semibold uppercase mb-1">Profit / kg</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{aiAnalysis.estimatedProfitPerKg}</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 text-center">
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Margin</p>
                  <p className="text-2xl font-bold text-blue-700">{aiAnalysis.profitMarginPercent.toFixed(1)}%</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                  <p className="text-xs text-purple-600 font-semibold uppercase mb-1">Demand</p>
                  <p className={`text-xl font-bold ${getDemandColor(aiAnalysis.demandLevel)}`}>
                    {aiAnalysis.demandLevel}
                  </p>
                </div>
              </div>

              {/* Additional insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Sell Window</p>
                  <p className="text-lg font-bold text-gray-800">⏱ {aiAnalysis.peakSellWindow}</p>
                </div>
                <div className={`rounded-xl p-4 border ${getRiskColor(aiAnalysis.spoilageRisk)}`}>
                  <p className="text-xs font-semibold uppercase mb-2">Spoilage Risk</p>
                  <p className="text-lg font-bold">⚠️ {aiAnalysis.spoilageRisk}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase mb-2">AI Recommends Buying</p>
                  <p className="text-lg font-bold text-gray-800">📦 {aiAnalysis.recommendedBuyQty} kg</p>
                </div>
              </div>

              {/* Why Buy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-green-700 mb-3">✅ Why You Should Buy</p>
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
                  <p className="text-sm font-bold text-red-600 mb-3">⚠️ Risks to Consider</p>
                  <ul className="space-y-2">
                    {aiAnalysis.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-red-50 p-3 rounded-lg border border-red-100">
                        <span className="text-red-400 mt-0.5">•</span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-semibold text-blue-700 mb-1">🧊 Storage Advice</p>
                    <p className="text-sm text-gray-700">{aiAnalysis.storageAdvice}</p>
                  </div>
                </div>
              </div>

              {/* Dynamic profit preview tied to purchase quantity */}
              <div className="bg-gradient-to-r from-purple-50 to-emerald-50 rounded-xl p-5 border border-purple-200">
                <p className="text-sm font-bold text-purple-700 mb-3">📊 Profit Preview for Your Order</p>
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <label className="text-sm text-gray-600 font-semibold">Quantity:</label>
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
                    <p className="text-xs text-gray-500 mb-1">You Pay (incl. GST)</p>
                    <p className="text-xl font-bold text-gray-800">₹{grandTotal.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Expected Revenue</p>
                    <p className="text-xl font-bold text-blue-700">₹{estimatedRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Est. Profit</p>
                    <p className="text-xl font-bold text-green-700">₹{estimatedProfit.toLocaleString()}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border">
                    <p className="text-xs text-gray-500 mb-1">Margin</p>
                    <p className="text-xl font-bold text-emerald-700">{aiAnalysis.profitMarginPercent.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              AI analysis unavailable. <button onClick={() => fetchAiAnalysis(currentProduct)} className="text-purple-600 underline">Retry</button>
            </div>
          )}
        </div>

        {/* ─── PURCHASE & PAYMENT GATEWAY ──────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-emerald-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            🛒 Purchase & Payment
          </h2>

          {paymentSuccess ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">
                {purchaseQty} kg of {currentProduct?.name} purchased for ₹{grandTotal.toLocaleString()}.
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
                {addedToInventory ? "✓ Added to Inventory" : "✓ Add to Inventory"}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <p className="text-sm font-bold text-gray-700 mb-3">Order Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentProduct?.name} × {purchaseQty} kg</span>
                    <span className="font-semibold">₹{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>GST (5%)</span>
                    <span>₹{gstAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-emerald-700">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
                {aiAnalysis && (
                  <div className="mt-3 text-xs text-green-600 font-medium bg-green-50 rounded-lg px-3 py-2">
                    💰 Est. profit after sale: ₹{estimatedProfit.toLocaleString()} ({aiAnalysis.profitMarginPercent.toFixed(1)}% margin)
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
                      Processing...
                    </>
                  ) : (
                    <>💳 Pay ₹{grandTotal.toLocaleString()} via Razorpay</>
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
                  {addedToInventory ? "✓ Added to Inventory" : "✓ Accept & Add to Inventory"}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Secured by Razorpay · UPI · Cards · Net Banking · Wallets accepted
              </p>
            </div>
          )}
        </div>

        {/* ─── FARMER DETAILS ──────────────────────────────────────────── */}
        <div className="mt-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">👨‍🌾 Farmer Information</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: "Farmer Name", value: currentProduct?.farmerName || "N/A", border: "border-green-600" },
                { label: "Farmer Email", value: currentProduct?.farmerEmail || "N/A", border: "border-green-600", mono: false },
                { label: "Contact", value: currentProduct?.farmerPhone || "N/A", border: "border-green-600" },
                { label: "Farm ID", value: currentProduct?.farmId || "N/A", border: "border-emerald-600", mono: true },
                { label: "Farm Location", value: currentProduct?.farmLocation || currentProduct?.locality || "N/A", border: "border-emerald-600" },
                { label: "Farm Size", value: currentProduct?.farmSize || "N/A", border: "border-lime-600" },
                { label: "Experience", value: `${currentProduct?.yearsOfExperience || "N/A"} years`, border: "border-lime-600" },
                { label: "Certification", value: currentProduct?.certification || "✓ Organic Certified", border: "border-lime-600" },
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
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Farmer Rating</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-yellow-500">{currentProduct?.farmerRating || "4.9"}</span>
                  <span className="text-yellow-500">{"⭐".repeat(Math.round(currentProduct?.farmerRating || 4.9))}</span>
                </div>
              </div>
            </div>

            {(currentProduct?.description || currentProduct?.farmerBio) && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3">About the Farmer</p>
                <p className="text-gray-700 leading-relaxed">
                  {currentProduct?.farmerBio || currentProduct?.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── PRODUCT QUALITY & SHELF LIFE ────────────────────────────── */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Product Quality Over Time</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-8">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">Expected Freshness Timeline</p>
                <div className="space-y-3">
                  {[
                    { label: "Days 1–3 (Peak Freshness)", pct: 100, color: "bg-green-500", text: "text-green-600" },
                    { label: "Days 4–7 (Good Quality)", pct: 75, color: "bg-yellow-500", text: "text-yellow-600" },
                    { label: "Days 8–12 (Fair Quality)", pct: 50, color: "bg-orange-500", text: "text-orange-600" },
                    { label: "Days 13+ (Poor Quality)", pct: 25, color: "bg-red-500", text: "text-red-600" },
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
                <p className="text-sm font-semibold text-gray-700 mb-4">Quality Metrics</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Color Quality", value: "Excellent", pct: 95 },
                    { label: "Texture Quality", value: "Excellent", pct: 92 },
                    { label: "Smell Quality", value: "Excellent", pct: 90 },
                    { label: "Ripeness Level", value: "Perfect", pct: 88 },
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Shelf Life & Storage Recommendations</h3>
                <div className="space-y-3">
                  {[
                    { icon: "bg-blue-600", symbol: "✓", text: <><strong>Optimal Use:</strong> Best consumed within <strong>10 days</strong> from listing date</> },
                    { icon: "bg-yellow-600", symbol: "!", text: <><strong>Good Quality:</strong> Suitable for sale up to <strong>15 days</strong> with proper storage</> },
                    { icon: "bg-red-600", symbol: "✕", text: <><strong>Not Recommended:</strong> After 15 days, quality significantly degrades</> },
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
                  <p className="text-sm font-semibold text-gray-900 mb-2">Storage Tips:</p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-2">
                    <li>• Store in cool, well-ventilated area (12–14°C optimal for mangoes)</li>
                    <li>• Keep away from direct sunlight</li>
                    <li>• Maintain humidity around 85–90%</li>
                    <li>• Check product daily for signs of degradation</li>
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