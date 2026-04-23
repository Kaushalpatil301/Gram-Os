"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../product/components/Header.jsx";
import Footer from "../../product/components/Footer.jsx";
import ProductDetails from "../../product/components/ProductDetails.jsx";
import Actions from "../../product/components/Actions.jsx";
import Notification from "../../product/components/Notification.jsx";
import Chatbot from "../../consumer/app/Chatbot.jsx";
import {
  TrendingUp, TrendingDown, Brain, Store, Wheat,
  MessageSquare, CheckCircle, XCircle, Clock, IndianRupee,
  MapPin, AlertTriangle, ChevronRight, Star, Package, BarChart3
} from "lucide-react";

const API_URL = "http://localhost:8000/api/v1/products";

// ── Static AI prediction data ──────────────────────────────────────────────
const AI_PREDICTIONS = {
  currentMsp: 1850,
  predictedPriceWeek: 2120,
  predictedPriceMonth: 2380,
  confidence: 87,
  trend: "up",
  mandiPrices: [
    { mandi: "APMC Pune",      price: 2050, distance: "12 km", trend: "up"   },
    { mandi: "APMC Nashik",    price: 1980, distance: "48 km", trend: "down" },
    { mandi: "Lasalgaon",      price: 2210, distance: "62 km", trend: "up"   },
    { mandi: "APMC Mumbai",    price: 2340, distance: "148 km", trend: "up"  },
    { mandi: "Solapur APMC",   price: 1890, distance: "95 km", trend: "down" },
  ],
  bestTimeToSell: "Next 10–14 days",
  aiTip: "Prices typically spike in the 2nd & 3rd week of the month due to wholesale demand. Holding 40–50% of produce for 1–2 more weeks could yield ₹250–₹350/qtl higher returns.",
  weeklyTrend: [1780, 1820, 1850, 1920, 2050, 2120, 2180],
};

// ── Static retailer bids / buyer requests ──────────────────────────────────
const INITIAL_BIDS = [
  {
    id: "b1", type: "retailer", name: "FreshMart Superstore", location: "Pune",
    offeredPrice: 2080, qty: "40 qtl", validTill: "2h 14m",
    message: "Need Grade-A tomatoes for weekend stocking. Can arrange pickup.",
    rating: 4.7, verified: true, status: "pending",
  },
  {
    id: "b2", type: "retailer", name: "Reliance Smart Bazaar", location: "Mumbai",
    offeredPrice: 2210, qty: "80 qtl", validTill: "5h 40m",
    message: "Bulk order for 3 outlets. Price negotiable for consistent supply.",
    rating: 4.9, verified: true, status: "pending",
  },
  {
    id: "b3", type: "wholesaler", name: "Patil Agro Traders", location: "Nashik",
    offeredPrice: 1950, qty: "120 qtl", validTill: "1h 05m",
    message: "Regular purchase for export processing unit. Competitive rate.",
    rating: 4.2, verified: false, status: "pending",
  },
  {
    id: "b4", type: "retailer", name: "Metro Cash & Carry", location: "Pune",
    offeredPrice: 2290, qty: "60 qtl", validTill: "10h 20m",
    message: "Premium slot for Grade-A produce. Cold chain logistics included.",
    rating: 4.8, verified: true, status: "pending",
  },
];

// ── Farmer requests (multiple farmers requesting from same product) ─────────
const FARMER_REQUESTS = [
  {
    id: "f1", farmerName: "Dinesh Pawar", village: "Sinnar", qty: "15 qtl",
    crop: "Tomato", requestType: "Bulk Buy Together", message: "Looking to pool produce for APMC Mumbai. Same crop grade.",
    time: "20 min ago", avatar: "👨‍🌾",
  },
  {
    id: "f2", farmerName: "Lata Jadhav", village: "Phaltan", qty: "22 qtl",
    crop: "Tomato", requestType: "Price Sharing", message: "Share buyer lead? I have similar grade produce ready.",
    time: "1 hr ago", avatar: "👩‍🌾",
  },
  {
    id: "f3", farmerName: "Mahesh Deshmukh", village: "Daund", qty: "30 qtl",
    crop: "Tomato", requestType: "Cooperative Sell", message: "Can we approach FPO together? More leverage on price.",
    time: "3 hr ago", avatar: "👨‍🌾",
  },
];

// ── Mini sparkline component ───────────────────────────────────────────────
function Sparkline({ values }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 160, h = 40;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 8) - 4;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline points={pts} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 8) - 4;
        return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
      })}
    </svg>
  );
}

export default function FarmerProductPage({ onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [showQR, setShowQR] = useState(false);
  const [notification, setNotification] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bids, setBids] = useState(INITIAL_BIDS);
  const [activeTab, setActiveTab] = useState("predictions");
  const [counterPrice, setCounterPrice] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`${API_URL}/${id}`);
          const product = response.data.data.product;
          setCurrentProduct(product);
          setNotification(`✅ Viewing: ${product.name}`);
        } catch (err) {
          setError("Product not found or failed to load");
          setNotification("❌ Failed to load product");
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
    setBids(prev => prev.map(b => b.id === bidId ? { ...b, status: action } : b));
    const bid = bids.find(b => b.id === bidId);
    if (action === "accepted") setNotification(`✅ Accepted bid from ${bid.name} at ₹${bid.offeredPrice}/qtl`);
    if (action === "rejected") setNotification(`❌ Rejected bid from ${bid.name}`);
    if (action === "countered") {
      const cp = counterPrice[bidId] || bid.offeredPrice;
      setNotification(`🔄 Counter offer ₹${cp}/qtl sent to ${bid.name}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Loading Product Details</h3>
          <p className="text-green-600">Fetching product information...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-2">{error || "Product not found"}</h3>
          <p className="text-gray-600 mb-4">Please check the product ID and try again.</p>
          <button onClick={() => navigate("/dashboard/farmer")} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Go to Farmer Dashboard
          </button>
        </div>
      </div>
    );
  }

  const pred = AI_PREDICTIONS;
  const cardCls = "bg-white rounded-2xl shadow-sm border border-gray-100 p-5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50">
      <Header
        onLogout={() => { setNotification("Logged out ✅"); if (onLogout) onLogout(); }}
        productId={id}
        showBackButton={true}
        title="Farmer Portal"
        subtitle="Product Analytics & Market Intelligence"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Role heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-1">Farmer View</h1>
          <p className="text-gray-500">Market Intelligence · Price Predictions · Buyer Negotiation</p>
        </div>

        {/* Product Details */}
        <ProductDetails product={currentProduct} />

        {/* Actions */}
        <div id="actions-section">
          <Actions showQR={showQR} setShowQR={setShowQR} productId={id} product={currentProduct} />
        </div>

        {/* ── Tab bar ── */}
        <div className="flex gap-2 border-b border-gray-200 pb-0">
          {[
            { id: "predictions", label: "AI Predictions", icon: <Brain className="w-4 h-4" /> },
            { id: "buyers",      label: "Buyer Offers",   icon: <Store className="w-4 h-4" />, badge: bids.filter(b => b.status === "pending").length },
            { id: "farmers",     label: "Farmer Requests",icon: <Wheat className="w-4 h-4" />, badge: FARMER_REQUESTS.length },
          ].map(tab => (
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
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
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
                { label: "MSP Rate",         value: `₹${pred.currentMsp}`, sub: "per quintal", icon: <IndianRupee className="w-5 h-5" />, color: "text-gray-700",    bg: "bg-gray-50"    },
                { label: "7-Day Forecast",   value: `₹${pred.predictedPriceWeek}`, sub: `+₹${pred.predictedPriceWeek - pred.currentMsp} gain`, icon: <TrendingUp className="w-5 h-5" />, color: "text-emerald-700", bg: "bg-emerald-50" },
                { label: "30-Day Forecast",  value: `₹${pred.predictedPriceMonth}`, sub: "Best case", icon: <BarChart3 className="w-5 h-5" />, color: "text-blue-700",    bg: "bg-blue-50"    },
                { label: "AI Confidence",    value: `${pred.confidence}%`, sub: "model accuracy", icon: <Brain className="w-5 h-5" />, color: "text-purple-700", bg: "bg-purple-50"  },
              ].map((c, i) => (
                <div key={i} className={`${cardCls} flex flex-col gap-2`}>
                  <div className={`w-9 h-9 ${c.bg} rounded-xl flex items-center justify-center ${c.color}`}>{c.icon}</div>
                  <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
                  <div className="text-xs text-gray-500">{c.label}</div>
                  <div className="text-[11px] text-gray-400">{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Trend sparkline + AI tip */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-600" />Weekly Price Trend</h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Bullish
                  </span>
                </div>
                <Sparkline values={pred.weeklyTrend} />
                <div className="mt-3 flex justify-between text-xs text-gray-400">
                  <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-semibold text-amber-700 flex items-center gap-1 mb-1"><Clock className="w-3 h-3" />Best Time to Sell</p>
                  <p className="text-sm font-bold text-amber-800">{pred.bestTimeToSell}</p>
                </div>
              </div>

              <div className={cardCls}>
                <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4"><Brain className="w-4 h-4 text-purple-600" />AI Recommendation</h3>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <p className="text-sm text-gray-700 leading-relaxed">{pred.aiTip}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Hold confidence</span>
                    <span className="font-semibold text-purple-700">{pred.confidence}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pred.confidence}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mandi prices */}
            <div className={cardCls}>
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-emerald-600" />Live Mandi Prices
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-400 text-xs">
                      {["Mandi", "₹/Quintal", "Distance", "Trend", "Action"].map(h => (
                        <th key={h} className="pb-2 pr-4 font-semibold uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pred.mandiPrices.map((m, i) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="py-3 pr-4 font-semibold text-gray-800">{m.mandi}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-base font-bold ${m.trend === "up" ? "text-emerald-600" : "text-red-500"}`}>₹{m.price}</span>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">{m.distance}</td>
                        <td className="py-3 pr-4">
                          {m.trend === "up"
                            ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold"><TrendingUp className="w-3 h-3" />Rising</span>
                            : <span className="flex items-center gap-1 text-red-500 text-xs font-semibold"><TrendingDown className="w-3 h-3" />Falling</span>}
                        </td>
                        <td className="py-3">
                          <button className="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors font-semibold">
                            Get Route
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
              <p className="text-sm text-gray-500">{bids.filter(b => b.status === "pending").length} active offers from retailers & wholesalers</p>
              <span className="text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Offers expire soon — act fast
              </span>
            </div>

            {bids.map(bid => (
              <div key={bid.id} className={`${cardCls} transition-all ${bid.status !== "pending" ? "opacity-60" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  {/* Buyer info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                      {bid.type === "retailer" ? "🏪" : "🏭"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{bid.name}</h4>
                        {bid.verified && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>}
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">{bid.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{bid.location}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < Math.floor(bid.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />)}
                        <span className="text-xs text-gray-500 ml-1">{bid.rating}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic">"{bid.message}"</p>
                    </div>
                  </div>

                  {/* Offer price */}
                  <div className="shrink-0 text-right">
                    <div className="text-3xl font-black text-emerald-700">₹{bid.offeredPrice}</div>
                    <div className="text-xs text-gray-400">/quintal · {bid.qty}</div>
                    <div className="flex items-center gap-1 text-xs text-red-500 font-semibold mt-1 justify-end">
                      <Clock className="w-3 h-3" /> Expires in {bid.validTill}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {bid.status === "pending" ? (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <div className="flex gap-2 flex-1">
                      <button onClick={() => handleBidAction(bid.id, "accepted")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Accept
                      </button>
                      <button onClick={() => handleBidAction(bid.id, "rejected")}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-colors">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Counter ₹</span>
                      <input
                        type="number"
                        value={counterPrice[bid.id] || bid.offeredPrice}
                        onChange={e => setCounterPrice(p => ({ ...p, [bid.id]: e.target.value }))}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                      <button onClick={() => handleBidAction(bid.id, "countered")}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 border border-amber-200 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Send Counter
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`mt-4 pt-4 border-t border-gray-100 text-sm font-semibold flex items-center gap-2 ${bid.status === "accepted" ? "text-emerald-600" : bid.status === "rejected" ? "text-red-500" : "text-amber-600"}`}>
                    {bid.status === "accepted" && <><CheckCircle className="w-4 h-4" /> Accepted — awaiting confirmation from buyer</>}
                    {bid.status === "rejected" && <><XCircle className="w-4 h-4" /> Rejected</>}
                    {bid.status === "countered" && <><MessageSquare className="w-4 h-4" /> Counter offer sent at ₹{counterPrice[bid.id]}</>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            TAB: FARMER REQUESTS
        ════════════════════════════════════════════════════════════ */}
        {activeTab === "farmers" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {FARMER_REQUESTS.length} nearby farmers are viewing this product and requesting to collaborate
            </p>

            {FARMER_REQUESTS.map(req => (
              <div key={req.id} className={`${cardCls} hover:shadow-md transition-shadow`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center text-2xl shrink-0">
                    {req.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900">{req.farmerName}</h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{req.village}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">
                          {req.requestType}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1 justify-end"><Clock className="w-3 h-3" />{req.time}</p>
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-semibold bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        <Package className="w-3 h-3" /> {req.qty} · {req.crop}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 italic">"{req.message}"</p>

                    <div className="mt-4 flex gap-2 flex-wrap">
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Connect
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors">
                        <MessageSquare className="w-4 h-4" /> Message
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-xl hover:bg-blue-100 border border-blue-200 transition-colors">
                        <ChevronRight className="w-4 h-4" /> View Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <Chatbot />
      <Footer />
      <Notification message={notification} />
    </div>
  );
}
