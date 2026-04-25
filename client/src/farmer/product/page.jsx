"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../product/components/Header.jsx";
import Footer from "../../product/components/Footer.jsx";
import ProductDetails from "../../product/components/ProductDetails.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";
import {
  LanguageProvider,
  useTranslation,
} from "../../consumer/i18n/config.jsx";
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Store,
  Wheat,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  IndianRupee,
  MapPin,
  AlertTriangle,
  ChevronRight,
  Star,
  Package,
  BarChart3,
  Activity,
} from "lucide-react";
import { apiLogout } from "../../lib/api.js";

const API_URL = import.meta.env.VITE_API_BASE_URL + "/products";

// ── Mini sparkline component ───────────────────────────────────────────────
function Sparkline({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 160,
    h = 40;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
      })}
    </svg>
  );
}

function FarmerProductPageContent({ onLogout }) {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [notification, setNotification] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bids, setBids] = useState([]);
  const [activeTab, setActiveTab] = useState("predictions");
  const [counterPrice, setCounterPrice] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/${id}`);
          let product = response.data.data.product;

          // Auto-fetch AI predicted price if missing
          if (!product.aiPredictedPrice) {
            try {
              const priceRes = await axios.post(
                `${API_URL}/${id}/predict-price`,
              );
              if (priceRes.data.success) {
                product.aiPredictedPrice = priceRes.data.data.predictedPrice;
              }
            } catch (e) {
              console.log("Failed to auto-fetch predicted price", e);
            }
          }

          setCurrentProduct(product);
          setNotification(t("farmer.product.viewing", { name: product.name }));

          // Generate dynamic buyer offers based on product details
          const targetPrice =
            product.aiPredictedPrice || product.basePrice * 1.2;
          const displayQty = product.quantity;
          setBids([
            {
              id: "b1",
              type: "retailer",
              name: "FreshMart Superstore",
              location: product.locality || "Pune",
              offeredPrice: Math.round(targetPrice * 0.98),
              qty: `${Math.min(displayQty, 400)} kg`,
              validTill: "2h 14m",
              message: `Need Grade-A ${product.name} for weekend stocking. Can arrange pickup.`,
              rating: 4.7,
              verified: true,
              status: "pending",
            },
            {
              id: "b2",
              type: "retailer",
              name: "Reliance Smart Bazaar",
              location: "Mumbai",
              offeredPrice: Math.round(targetPrice * 1.05),
              qty: `${displayQty} kg`,
              validTill: "5h 40m",
              message: `Bulk order for 3 outlets. Price negotiable for consistent supply of ${product.name}.`,
              rating: 4.9,
              verified: true,
              status: "pending",
            },
            {
              id: "b3",
              type: "wholesaler",
              name: "Patil Agro Traders",
              location: "Nashik",
              offeredPrice: Math.round(targetPrice * 0.92),
              qty: `${Math.min(displayQty * 0.5, 1200)} kg`,
              validTill: "1h 05m",
              message: `Regular purchase of ${product.type} for export processing unit. Competitive rate.`,
              rating: 4.2,
              verified: false,
              status: "pending",
            },
          ]);
        } catch (err) {
          setError(t("farmer.product.errorNotFound"));
          setNotification(t("farmer.product.errorLoad"));
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBidAction = (bidId, action) => {
    setBids((prev) =>
      prev.map((b) => (b.id === bidId ? { ...b, status: action } : b)),
    );
    const bid = bids.find((b) => b.id === bidId);
    if (action === "accepted") {
      setNotification(
        t("farmer.product.bidAccepted", {
          name: bid.name,
          price: bid.offeredPrice,
        }),
      );
    }
    if (action === "rejected") {
      setNotification(t("farmer.product.bidRejected", { name: bid.name }));
    }
    if (action === "countered") {
      const cp = counterPrice[bidId] || bid.offeredPrice;
      setNotification(
        t("farmer.product.bidCountered", { price: cp, name: bid.name }),
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">
            {t("farmer.product.loadingTitle")}
          </h3>
          <p className="text-green-600">
            {t("farmer.product.loadingSubtitle")}
          </p>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            {error || t("farmer.product.notFound")}
          </h3>
          <p className="text-gray-600 mb-4">
            {t("farmer.product.checkProductId")}
          </p>
          <button
            onClick={() => navigate("/dashboard/farmer")}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            {t("farmer.product.goDashboard")}
          </button>
        </div>
      </div>
    );
  }

  const base = currentProduct?.basePrice || 100;
  const target = currentProduct?.aiPredictedPrice || base * 1.2;
  const pred = {
    currentMsp: base * 0.9,
    predictedPriceWeek: target,
    predictedPriceMonth: target * 1.05,
    confidence: 87,
    trend: target >= base ? "up" : "down",
    mandiPrices: [
      {
        mandi: "APMC Pune",
        price: Math.round(target * 0.98),
        distance: "12 km",
        trend: "up",
      },
      {
        mandi: "APMC Nashik",
        price: Math.round(target * 0.95),
        distance: "48 km",
        trend: "down",
      },
      {
        mandi: "Lasalgaon",
        price: Math.round(target * 1.02),
        distance: "62 km",
        trend: "up",
      },
      {
        mandi: "APMC Mumbai",
        price: Math.round(target * 1.05),
        distance: "148 km",
        trend: "up",
      },
      {
        mandi: "Solapur APMC",
        price: Math.round(target * 0.92),
        distance: "95 km",
        trend: "down",
      },
    ],
    bestTimeToSell: t("farmer.product.bestTimeToSell"),
    aiTip: t("farmer.product.aiTip"),
    weeklyTrend: [
      base,
      base * 1.02,
      base * 1.05,
      target * 0.95,
      target * 0.98,
      target,
      target * 1.02,
    ].map(Math.round),
  };

  const cardCls = "bg-white rounded-2xl shadow-sm border border-gray-100 p-5";

  const handleLogout = async () => {
    setNotification(t("header.logoutSuccess"));
    await apiLogout();
    if (onLogout) onLogout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      <Header
        onLogout={handleLogout}
        productId={id}
        showBackButton={true}
        title={t("farmer.product.portalTitle")}
        subtitle={t("farmer.product.portalSubtitle")}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Product Details */}
        <ProductDetails product={currentProduct} hideFarmerDetails={true} />

        {/* ── Tab bar ── */}
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {[
            {
              id: "predictions",
              label: t("farmer.product.tab.predictions"),
              icon: <Brain className="w-4 h-4" />,
            },
            {
              id: "buyers",
              label: t("farmer.product.tab.buyers"),
              icon: <Store className="w-4 h-4" />,
              badge: bids.filter((b) => b.status === "pending").length,
            },
            {
              id: "journey",
              label: t("farmer.product.tab.journey"),
              icon: <Activity className="w-4 h-4" />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-emerald-600 text-emerald-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge != null && (
                <span
                  className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════════════════
            TAB: AI PREDICTIONS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "predictions" && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: t("farmer.product.baseRate"),
                  value: `₹${currentProduct?.basePrice}`,
                  sub: t("farmer.product.perKg"),
                  icon: <IndianRupee className="w-5 h-5" />,
                  color: "text-gray-700",
                  bg: "bg-gray-50",
                },
                {
                  label: t("farmer.product.aiPredictedPrice"),
                  value: currentProduct?.aiPredictedPrice
                    ? `₹${currentProduct.aiPredictedPrice}`
                    : t("farmer.product.calculating"),
                  sub: currentProduct?.aiPredictedPrice
                    ? `${currentProduct.aiPredictedPrice >= currentProduct.basePrice ? "+" : ""}₹${currentProduct.aiPredictedPrice - currentProduct.basePrice} ${t("farmer.product.vsBase")}`
                    : t("farmer.product.checkingMarket"),
                  icon: <TrendingUp className="w-5 h-5" />,
                  color: "text-emerald-700",
                  bg: "bg-emerald-50",
                },
                {
                  label: t("farmer.product.forecast30"),
                  value: `₹${currentProduct?.aiPredictedPrice ? (currentProduct.aiPredictedPrice * 1.1).toFixed(2) : "..."}`,
                  sub: t("farmer.product.bestCase"),
                  icon: <BarChart3 className="w-5 h-5" />,
                  color: "text-blue-700",
                  bg: "bg-blue-50",
                },
                {
                  label: t("farmer.product.aiConfidence"),
                  value: `${pred.confidence}%`,
                  sub: t("farmer.product.modelAccuracy"),
                  icon: <Brain className="w-5 h-5" />,
                  color: "text-purple-700",
                  bg: "bg-purple-50",
                },
              ].map((c, i) => (
                <div key={i} className={`${cardCls} flex flex-col gap-2`}>
                  <div
                    className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center ${c.color}`}
                  >
                    {c.icon}
                  </div>
                  <div className={`text-2xl font-bold ${c.color}`}>
                    {c.value}
                  </div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className="text-[11px] text-gray-400">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Trend sparkline + AI tip */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    {t("farmer.product.weeklyTrend")}
                  </h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />{" "}
                    {t("farmer.product.bullish")}
                  </span>
                </div>
                <Sparkline values={pred.weeklyTrend} />
                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>{t("analytics.day.mon")}</span>
                  <span>{t("analytics.day.tue")}</span>
                  <span>{t("analytics.day.wed")}</span>
                  <span>{t("analytics.day.thu")}</span>
                  <span>{t("analytics.day.fri")}</span>
                  <span>{t("analytics.day.sat")}</span>
                  <span>{t("analytics.day.sun")}</span>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    {t("farmer.product.bestTimeLabel")}
                  </p>
                  <p className="text-sm font-bold text-amber-800">
                    {pred.bestTimeToSell}
                  </p>
                </div>
              </div>

              <div className={cardCls}>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Brain className="w-4 h-4 text-purple-600" />
                  {t("farmer.product.aiRecommendation")}
                </h3>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {pred.aiTip}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      {t("farmer.product.holdConfidence")}
                    </span>
                    <span className="font-semibold text-purple-700">
                      {pred.confidence}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Mandi prices */}
            <div className={cardCls}>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {t("farmer.product.liveMandiPrices")}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-400 text-xs">
                      {[
                        t("farmer.product.table.mandi"),
                        t("farmer.product.table.rate"),
                        t("farmer.product.table.distance"),
                        t("farmer.product.table.trend"),
                        t("farmer.product.table.action"),
                      ].map((h) => (
                        <th
                          key={h}
                          className="pb-2 pr-4 font-semibold uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pred.mandiPrices.map((m, i) => (
                      <tr
                        key={i}
                        className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 pr-4 font-semibold text-gray-800">
                          {m.mandi}
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`text-base font-bold ${m.trend === "up" ? "text-emerald-600" : "text-red-500"}`}
                          >
                            ₹{m.price}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {m.distance}
                        </td>
                        <td className="py-3 pr-4">
                          {m.trend === "up" ? (
                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                              <TrendingUp className="w-3 h-3" />
                              {t("farmer.product.rising")}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                              <TrendingDown className="w-3 h-3" />
                              {t("farmer.product.falling")}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <button className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors font-semibold">
                            {t("farmer.product.getRoute")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: BUYER OFFERS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "buyers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {t("farmer.product.activeOffers", {
                  count: bids.filter((b) => b.status === "pending").length,
                })}
              </p>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />{" "}
                {t("farmer.product.offersExpire")}
              </span>
            </div>

            {bids.map((bid) => (
              <div
                key={bid.id}
                className={`${cardCls} transition-all ${bid.status !== "pending" ? "opacity-60" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Buyer info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {bid.type === "retailer" ? "🏪" : "🏭"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{bid.name}</h4>
                        {bid.verified && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {t("farmer.product.verified")}
                          </span>
                        )}
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                          {bid.type === "retailer"
                            ? t("farmer.product.typeRetailer")
                            : t("farmer.product.typeWholesaler")}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {bid.location}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < Math.floor(bid.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          {bid.rating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{bid.message}"
                      </p>
                    </div>
                  </div>

                  {/* Offer price */}
                  <div className="shrink-0 text-right">
                    <div className="text-3xl font-black text-emerald-700">
                      ₹{bid.offeredPrice}
                    </div>
                    <div className="text-xs text-gray-400">
                      {t("farmer.product.perQuintalQty", { qty: bid.qty })}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1 justify-end">
                      <Clock className="w-3 h-3" />{" "}
                      {t("farmer.product.expiresIn", { time: bid.validTill })}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {bid.status === "pending" ? (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex gap-2 flex-1">
                      <button
                        onClick={() => handleBidAction(bid.id, "accepted")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />{" "}
                        {t("farmer.product.accept")}
                      </button>
                      <button
                        onClick={() => handleBidAction(bid.id, "rejected")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />{" "}
                        {t("farmer.product.reject")}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {t("farmer.product.counter")}
                      </span>
                      <input
                        type="number"
                        value={counterPrice[bid.id] || bid.offeredPrice}
                        onChange={(e) =>
                          setCounterPrice((p) => ({
                            ...p,
                            [bid.id]: e.target.value,
                          }))
                        }
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleBidAction(bid.id, "countered")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 border border-amber-200 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />{" "}
                        {t("farmer.product.sendCounter")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`mt-4 pt-4 border-t border-gray-100 text-sm font-semibold flex items-center gap-2 ${bid.status === "accepted" ? "text-emerald-600" : bid.status === "rejected" ? "text-red-500" : "text-amber-600"}`}
                  >
                    {bid.status === "accepted" && (
                      <>
                        <CheckCircle className="w-4 h-4" />{" "}
                        {t("farmer.product.acceptedAwaiting")}
                      </>
                    )}
                    {bid.status === "rejected" && (
                      <>
                        <XCircle className="w-4 h-4" />{" "}
                        {t("farmer.product.rejected")}
                      </>
                    )}
                    {bid.status === "countered" && (
                      <>
                        <MessageSquare className="w-4 h-4" />{" "}
                        {t("farmer.product.counterSent", {
                          price: counterPrice[bid.id],
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: JOURNEY
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "journey" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">
              {t("farmer.product.traceabilityProjected")}
            </h2>
            <div className="relative border-l-2 border-emerald-200 ml-4 space-y-8 pb-4">
              {/* Consumer Node */}
              <div className="relative pl-8">
                <div className="absolute -left-2.5 bg-blue-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 opacity-60">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                    {t("farmer.product.endConsumerProjected")}
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.stakeholder")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {t("farmer.product.urbanShoppers")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.location")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{" "}
                        {t("farmer.product.mumbaiCity")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.retailPrice")}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {Math.round(
                          (currentProduct?.aiPredictedPrice ||
                            (currentProduct?.basePrice || 100) * 1.2) * 1.4,
                        )}
                        /kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.quantity")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />{" "}
                        {t("farmer.product.retailLots")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Retailer/Wholesaler Node */}
              <div className="relative pl-8">
                <div className="absolute -left-2.5 bg-purple-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100 ring-1 ring-emerald-50">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full border border-purple-100">
                    {t("farmer.product.currentPhaseBidding")}
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.stakeholder")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {t("farmer.product.marketplaceBuyers")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.location")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{" "}
                        {t("farmer.product.nationwide")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.marketValue")}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {currentProduct?.aiPredictedPrice ||
                          Math.round((currentProduct?.basePrice || 100) * 1.2)}
                        /kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.quantity")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />{" "}
                        {t("farmer.product.fullBatchQty", {
                          qty: currentProduct?.quantity,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Farmer Origin Node */}
              <div className="relative pl-8">
                <div className="absolute -left-2.5 bg-emerald-500 w-5 h-5 rounded-full border-4 border-white shadow-sm" />
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    {t("farmer.product.originHarvest")}
                  </span>
                  <div className="mt-3 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.stakeholder")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {currentProduct?.farmerEmail ||
                          t("farmer.product.youFarmer")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.location")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />{" "}
                        {currentProduct?.locality}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.baseAskingPrice")}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        {currentProduct?.basePrice}/kg
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        {t("farmer.product.quantityHarvested")}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                        <Package className="w-3 h-3 text-gray-400" />{" "}
                        {t("farmer.product.qtyKg", {
                          qty: currentProduct?.quantity,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Chatbot />
      <Footer />
      <Notification message={notification} />
    </div>
  );
}

export default function FarmerProductPage({ onLogout }) {
  return (
    <LanguageProvider>
      <FarmerProductPageContent onLogout={onLogout} />
    </LanguageProvider>
  );
}
