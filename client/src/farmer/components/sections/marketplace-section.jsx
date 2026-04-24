import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Leaf, ShoppingCart, Star, Search, CheckCircle, CreditCard,
  X, Loader2, IndianRupee, Brain, TrendingUp, Droplets,
  Thermometer, Wind, AlertCircle, ChevronDown, ChevronUp, Info
} from "lucide-react";

const RAZORPAY_KEY_ID = "rzp_test_SbpLusWieguIBI";

const FARMER_CONTEXT = {
  soil: "Black Cotton (Vertisol)",
  irrigation: "Drip",
  location: "Koregaon, Pune",
  landSize: "3.5 acres",
  rainfall: "650mm avg",
  prevCrop: "Soybean",
};

const MOCK_VENDORS = [
  { id: 1, name: "KrishiMart Nashik", type: "Seeds", rating: 4.5, verified: true, distance: "12 km", products: ["Tomato Seeds (Hybrid)", "Onion Sets"], prices: ["₹180/kg", "₹120/kg"], rawPrices: [180, 120], fairPrice: true },
  { id: 2, name: "Agro Inputs Pune", type: "Fertilizer", rating: 4.2, verified: true, distance: "8 km", products: ["DAP 50kg", "Urea 45kg"], prices: ["₹1,350/bag", "₹270/bag"], rawPrices: [1350, 270], fairPrice: true },
  { id: 3, name: "GreenShield Agri", type: "Pesticides", rating: 3.9, verified: true, distance: "15 km", products: ["Neem Oil 1L", "Copper Fungicide"], prices: ["₹320/L", "₹450/kg"], rawPrices: [320, 450], fairPrice: true },
  { id: 4, name: "Sahyadri Seeds", type: "Seeds", rating: 4.7, verified: true, distance: "22 km", products: ["Wheat HD-2967", "Bajra HHB-67"], prices: ["₹85/kg", "₹120/kg"], rawPrices: [85, 120], fairPrice: true },
  { id: 5, name: "Maha Fertilizers", type: "Fertilizer", rating: 3.6, verified: false, distance: "5 km", products: ["NPK 10:26:26", "SSP 50kg"], prices: ["₹1,480/bag", "₹420/bag"], rawPrices: [1480, 420], fairPrice: false },
];

const AI_RECOMMENDATIONS = [
  {
    crop: "Tomato (Hybrid)",
    variety: "Arka Rakshak / Namdhari NS 2535",
    confidence: 92,
    mandiPrice: "₹38/kg",
    priceRange: "₹32–45/kg",
    season: "Kharif",
    waterNeeded: "Medium",
    duration: "90–120 days",
    expectedYield: "25–30 tonnes/acre",
    inputCost: "~₹28,000/acre",
    netProfit: "~₹67,000/acre",
    signals: [
      { icon: "🌍", label: "Soil Match", value: "Black cotton retains moisture — ideal for tomato root development", positive: true },
      { icon: "💧", label: "Irrigation Fit", value: "Drip irrigation reduces fungal risk by 40% vs flood", positive: true },
      { icon: "📈", label: "Mandi Demand", value: "Pune APMC showing 18% YoY price rise for hybrid tomatoes", positive: true },
      { icon: "🌦️", label: "Rainfall", value: "650mm avg is within optimal 500–800mm range", positive: true },
      { icon: "⚠️", label: "Risk", value: "Leaf curl virus risk in Aug–Sep. Use virus-resistant variety.", positive: false },
    ],
    whyNotOthers: "Wheat ruled out — low MSP ROI for your land size. Cotton skipped — drip not cost-effective for cotton at 3.5 acres.",
  },
  {
    crop: "Onion (Nashik Red)",
    variety: "Bhima Raj / NHRDF Red",
    confidence: 87,
    mandiPrice: "₹28/kg",
    priceRange: "₹22–36/kg",
    season: "Rabi",
    waterNeeded: "Low",
    duration: "120–150 days",
    expectedYield: "12–16 tonnes/acre",
    inputCost: "~₹18,000/acre",
    netProfit: "~₹40,000/acre",
    signals: [
      { icon: "🌍", label: "Soil Match", value: "Vertisol with good drainage — prevents bulb rot", positive: true },
      { icon: "📦", label: "Export Demand", value: "Strong Middle East export window opens Q3 2026", positive: true },
      { icon: "💧", label: "Water Efficiency", value: "Low water needs suits your drip setup in dry Rabi months", positive: true },
      { icon: "🔄", label: "Crop Rotation", value: "After soybean — good N replenishment for onion growth", positive: true },
      { icon: "⚠️", label: "Risk", value: "Price volatility high. Store 30% yield for better offseason rates.", positive: false },
    ],
    whyNotOthers: "Grapes skipped — requires 5+ years setup. Sugarcane skipped — water intensive, not suited to drip at this scale.",
  },
  {
    crop: "Soybean",
    variety: "JS 335 / MACS 1188",
    confidence: 78,
    mandiPrice: "₹4,200/qtl",
    priceRange: "₹4,100–4,892/qtl",
    season: "Kharif",
    waterNeeded: "Medium",
    duration: "95–110 days",
    expectedYield: "12–15 qtl/acre",
    inputCost: "~₹10,000/acre",
    netProfit: "~₹35,000/acre",
    signals: [
      { icon: "🏛️", label: "MSP Safety Net", value: "Govt MSP at ₹4,892/qtl — guaranteed floor price", positive: true },
      { icon: "🌿", label: "Soil Health", value: "Nitrogen fixation improves soil for next Rabi season", positive: true },
      { icon: "💰", label: "Low Input Cost", value: "Lowest input cost of all 3 recommendations", positive: true },
      { icon: "📉", label: "Market Price", value: "Current mandi rate ₹200 below MSP — sell to govt procurement", positive: false },
      { icon: "⚠️", label: "Risk", value: "Moderate yield on black cotton without proper drainage management", positive: false },
    ],
    whyNotOthers: "Ranked 3rd due to lower profit margin vs tomato despite lower risk profile.",
  },
];

function useRazorpay() {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (window.Razorpay) { setLoaded(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => setLoaded(true);
    document.body.appendChild(script);
  }, []);
  return loaded;
}

function initiateRazorpay({ amount, cartItems, onSuccess, onFailure }) {
  if (!window.Razorpay) { alert("Payment SDK not loaded."); return; }
  const rzp = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: amount * 100,
    currency: "INR",
    name: "KisanBazaar",
    description: `Order: ${cartItems.map(i => i.product).join(", ")}`,
    handler: (response) => onSuccess(response),
    prefill: { name: "Farmer", email: "farmer@example.com", contact: "9999999999" },
    theme: { color: "#059669" },
    modal: { ondismiss: () => onFailure("dismissed") },
  });
  rzp.on("payment.failed", (r) => onFailure(r.error.description));
  rzp.open();
}

function PaymentModal({ status, paymentId, error, onClose }) {
  if (!status) return null;
  const isSuccess = status === "success";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isSuccess ? "bg-emerald-100" : "bg-red-100"}`}>
          {isSuccess ? <CheckCircle className="w-10 h-10 text-emerald-600" /> : <X className="w-10 h-10 text-red-500" />}
        </div>
        <h3 className={`text-2xl font-black mb-2 ${isSuccess ? "text-emerald-700" : "text-red-600"}`}>{isSuccess ? "Payment Successful!" : "Payment Failed"}</h3>
        {isSuccess ? (
          <>
            <p className="text-gray-500 text-sm mb-3">Your order has been placed with the vendors.</p>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 uppercase font-semibold">Payment ID</p>
              <p className="text-sm font-mono font-bold text-gray-700 mt-1 break-all">{paymentId}</p>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">{error || "Something went wrong."}</p>
        )}
        <Button onClick={onClose} className={`w-full mt-6 py-5 font-bold cursor-pointer ${isSuccess ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-800 hover:bg-gray-900"}`}>
          {isSuccess ? "Done" : "Try Again"}
        </Button>
      </div>
    </div>
  );
}

function OrderSummary({ cartItems, onRemove, onPay, paying, razorpayLoaded }) {
  const total = cartItems.reduce((sum, item) => sum + item.rawPrice, 0);
  const gst = Math.round(total * 0.05);
  const grandTotal = total + gst;

  return (
    <div className="space-y-4">
      {cartItems.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">Browse vendors to add inputs.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {cartItems.map(item => (
              <Card key={item.id} className="border-0 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{item.product}</p>
                    <p className="text-xs text-gray-400 mt-0.5">from {item.vendor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-700">{item.price}</span>
                    <button onClick={() => onRemove(item.id)} className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="border-0 shadow-md bg-gray-50">
            <CardContent className="p-5 space-y-3">
              <h4 className="font-bold text-gray-800 flex items-center gap-2"><IndianRupee className="w-4 h-4 text-emerald-600" /> Bill Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600"><span>Subtotal ({cartItems.length} items)</span><span>₹{total.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-gray-600"><span>GST (5%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-gray-400 text-xs"><span>Delivery</span><span className="text-emerald-600 font-semibold">FREE</span></div>
                <div className="border-t pt-2 flex justify-between font-black text-gray-900 text-base">
                  <span>Total Payable</span>
                  <span className="text-emerald-700">₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {!razorpayLoaded && <p className="text-xs text-amber-600 text-center">⚠ Loading payment SDK…</p>}
          <Button disabled={paying || !razorpayLoaded} onClick={() => onPay(grandTotal)} className="w-full py-6 text-base font-bold bg-emerald-600 hover:bg-emerald-700 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
            {paying ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing…</> : <><CreditCard className="w-5 h-5" /> Pay ₹{grandTotal.toLocaleString("en-IN")} via Razorpay</>}
          </Button>
          <p className="text-xs text-gray-400 text-center">Secured by Razorpay · UPI · Cards · Net Banking</p>
        </>
      )}
    </div>
  );
}

// ── AI Explainability Card ────────────────────────────────────────────────────
function CropRecommendationCard({ rec, index, onBrowseInputs, onBuyBundle }) {
  const [expanded, setExpanded] = useState(index === 0);

  const rankColors = ["border-l-emerald-500", "border-l-blue-400", "border-l-amber-400"];
  const rankBg = ["bg-emerald-600", "bg-blue-500", "bg-amber-500"];
  const confidenceColor = rec.confidence >= 90 ? "text-emerald-600" : rec.confidence >= 80 ? "text-blue-600" : "text-amber-600";
  const confidenceBg = rec.confidence >= 90 ? "bg-emerald-50" : rec.confidence >= 80 ? "bg-blue-50" : "bg-amber-50";

  return (
    <Card className={`border-0 border-l-4 ${rankColors[index]} shadow-md hover:shadow-lg transition-all`}>
      <CardContent className="p-0">
        {/* Card Header — always visible */}
        <div
          className="p-5 cursor-pointer select-none"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Rank Badge */}
              <div className={`w-8 h-8 rounded-xl ${rankBg[index]} text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5`}>
                {index === 0 ? "★" : `#${index + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-gray-900 text-base">{rec.crop}</h4>
                  {index === 0 && <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Top Pick</Badge>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Variety: {rec.variety}</p>
                {/* Quick stats row */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-sm font-bold text-emerald-700">{rec.mandiPrice}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{rec.season}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-500">{rec.duration}</span>
                </div>
              </div>
            </div>

            {/* Confidence Meter */}
            <div className={`${confidenceBg} rounded-2xl px-3 py-2 text-center shrink-0`}>
              <div className={`text-2xl font-black ${confidenceColor}`}>{rec.confidence}%</div>
              <div className="text-[9px] text-gray-400 uppercase font-bold tracking-wide">AI Score</div>
            </div>
          </div>

          {/* Expand toggle */}
          <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 font-medium">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? "Hide details" : "Why did AI recommend this?"}
          </div>
        </div>

        {/* Expanded Section */}
        {expanded && (
          <div className="border-t border-gray-100 px-5 pb-5 space-y-5 pt-4">

            {/* Profit Snapshot */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "Expected Yield", value: rec.expectedYield, color: "text-gray-800" },
                { label: "Input Cost", value: rec.inputCost, color: "text-red-600" },
                { label: "Est. Profit", value: rec.netProfit, color: "text-emerald-700" },
              ].map((s, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                  <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  <div className="text-[10px] text-gray-400 uppercase font-semibold mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            {/* AI Signal Breakdown — the explainability */}
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Why AI chose this</span>
              </div>
              <div className="space-y-2">
                {rec.signals.map((signal, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-xl p-3 ${signal.positive ? "bg-emerald-50/60" : "bg-red-50/60"}`}>
                    <span className="text-base shrink-0 mt-0.5">{signal.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs font-bold ${signal.positive ? "text-emerald-700" : "text-red-600"}`}>{signal.label} &nbsp;</span>
                      <span className="text-xs text-gray-600">{signal.value}</span>
                    </div>
                    <span className="shrink-0 mt-0.5">{signal.positive ? "✓" : "!"}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Why not others */}
            <div className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Why other crops were ranked lower</p>
                <p className="text-xs text-gray-600">{rec.whyNotOthers}</p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 cursor-pointer" onClick={onBuyBundle}>Buy Full Bundle</Button>
              <Button size="sm" variant="outline" className="cursor-pointer" onClick={onBrowseInputs}>Browse Inputs →</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function MarketplaceSection() {
  const [activeTab, setActiveTab] = useState("recommend");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [cartItems, setCartItems] = useState([]);
  const [paying, setPaying] = useState(false);
  const [paymentModal, setPaymentModal] = useState(null);

  const razorpayLoaded = useRazorpay();

  const filteredVendors = MOCK_VENDORS.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchType = filterType === "all" || v.type === filterType;
    return matchSearch && matchType;
  });

  const addToCart = (vendor, product, price, rawPrice) => {
    setCartItems(prev => [...prev, { vendor: vendor.name, product, price, rawPrice, id: Date.now() + Math.random() }]);
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(c => c.id !== id));

  const handleBuyBundle = (rec) => {
    const items = [
      { vendor: "KrishiMart Nashik", product: `${rec.crop} Seeds`, price: "₹450/packet", rawPrice: 450, id: Date.now() + 1 },
      { vendor: "Agro Inputs Pune", product: "DAP Fertilizer (50kg)", price: "₹1,350/bag", rawPrice: 1350, id: Date.now() + 2 },
      { vendor: "GreenShield Agri", product: "Neem Oil 1L", price: "₹320/L", rawPrice: 320, id: Date.now() + 3 }
    ];
    setCartItems(prev => [...prev, ...items]);
    setActiveTab("cart");
  };

  const handlePay = async (amount) => {
    setPaying(true);
    try {
      const orderRes = await axios.post("http://localhost:8000/api/v1/marketplace/create-order", { amount });
      const order = orderRes.data.data;

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "KisanBazaar",
        description: "Input Marketplace Order",
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post("http://localhost:8000/api/v1/marketplace/verify-payment", response);
            setPaying(false);
            setPaymentModal({ status: "success", paymentId: response.razorpay_payment_id });
            setCartItems([]);
          } catch (error) {
            setPaying(false);
            setPaymentModal({ status: "failure", error: "Payment verification failed" });
          }
        },
        prefill: {
          name: "Farmer",
          email: "farmer@agrichain.com",
          contact: "9999999999"
        },
        theme: { color: "#059669" },
        modal: { ondismiss: () => { setPaying(false); if (paymentModal?.error !== "dismissed") setPaymentModal({ status: "failure", error: "dismissed" }); } },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (r) => {
        setPaying(false);
        setPaymentModal({ status: "failure", error: r.error.description });
      });
      rzp.open();
    } catch (error) {
      setPaying(false);
      setPaymentModal({ status: "failure", error: "Failed to initialize payment" });
    }
  };

  return (
    <div className="space-y-6">
      {paymentModal && (
        <PaymentModal
          status={paymentModal.status}
          paymentId={paymentModal.paymentId}
          error={paymentModal.error}
          onClose={() => { setPaymentModal(null); if (paymentModal.status === "success") setActiveTab("recommend"); }}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-xl"><ShoppingCart className="w-5 h-5 text-emerald-700" /></div>
            Input Marketplace
          </h2>
          <p className="text-gray-500 mt-1 text-sm">AI crop recommendations + verified input vendors for your next season.</p>
        </div>
        {cartItems.length > 0 && (
          <button onClick={() => setActiveTab("cart")} className="cursor-pointer">
            <Badge className="bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-700 transition-colors">
              🛒 {cartItems.length} in cart
            </Badge>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1.5">
        {[
          { id: "recommend", label: "🤖 AI Advisor" },
          { id: "vendors", label: "🛒 Vendors" },
          { id: "cart", label: `📦 Orders (${cartItems.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* AI Crop Advisor Tab */}
      {activeTab === "recommend" && (
        <div className="space-y-4">

          {/* Farmer Context Card — shows what data the AI used */}
          <div className="bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">AI analysed your farm profile</span>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {[
                { label: "Soil", value: "Black Cotton" },
                { label: "Irrigation", value: FARMER_CONTEXT.irrigation },
                { label: "Location", value: FARMER_CONTEXT.location },
                { label: "Land", value: FARMER_CONTEXT.landSize },
                { label: "Rainfall", value: FARMER_CONTEXT.rainfall },
                { label: "Prev Crop", value: FARMER_CONTEXT.prevCrop },
              ].map((f, i) => (
                <div key={i} className="bg-white/70 rounded-xl p-2 text-center">
                  <div className="text-xs font-bold text-gray-700 truncate">{f.value}</div>
                  <div className="text-[9px] text-gray-400 uppercase font-semibold mt-0.5">{f.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendation Cards */}
          {AI_RECOMMENDATIONS.map((rec, i) => (
            <CropRecommendationCard
              key={i}
              rec={rec}
              index={i}
              onBrowseInputs={() => setActiveTab("vendors")}
              onBuyBundle={() => handleBuyBundle(rec)}
            />
          ))}
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === "vendors" && (
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search vendors or products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <select value={filterType} onChange={e => setFilterType(e.target.value)} className="h-10 rounded-md border border-gray-200 px-3 text-sm bg-white">
              <option value="all">All Types</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Pesticides">Pesticides</option>
            </select>
          </div>

          {filteredVendors.map(vendor => (
            <Card key={vendor.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl shrink-0">
                      {vendor.type === "Seeds" ? "🌱" : vendor.type === "Fertilizer" ? "🧪" : "🛡️"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-gray-900">{vendor.name}</h4>
                        {vendor.verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {vendor.rating}</span>
                        <span>{vendor.distance}</span>
                        <Badge variant="outline" className="text-xs">{vendor.type}</Badge>
                      </div>
                    </div>
                  </div>
                  {vendor.fairPrice && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs shrink-0">Fair Price ✓</Badge>}
                </div>
                <div className="mt-4 space-y-2">
                  {vendor.products.map((product, pi) => (
                    <div key={pi} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div>
                        <span className="text-sm font-medium text-gray-800">{product}</span>
                        <span className="ml-3 text-sm font-bold text-emerald-700">{vendor.prices[pi]}</span>
                      </div>
                      <Button size="sm" variant="outline" className="text-xs cursor-pointer hover:bg-emerald-50"
                        onClick={() => addToCart(vendor, product, vendor.prices[pi], vendor.rawPrices[pi])}>
                        + Add
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === "cart" && (
        <OrderSummary
          cartItems={cartItems}
          onRemove={removeFromCart}
          onPay={handlePay}
          paying={paying}
          razorpayLoaded={razorpayLoaded}
        />
      )}
    </div>
  );
}