// components/sections/map-section.jsx
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  X, TrendingUp, TrendingDown, Minus, Brain, AlertTriangle,
  ArrowUpRight, ArrowDownRight, BarChart3, MapPin, Zap,
  ChevronDown, ChevronUp, Info, IndianRupee, Eye
} from "lucide-react"

// ── Mock Data ─────────────────────────────────────────────────────────────────
const PRICE_DATA = [
  {
    id: 1, city: "Mumbai", state: "Maharashtra", lat: 19.0760, lng: 72.8777,
    prices: {
      tomatoes: { farmer: 25, wholesale: 35, retail: 45, trend: "up", weekChange: +8 },
      onions:   { farmer: 18, wholesale: 28, retail: 38, trend: "down", weekChange: -5 },
      potatoes: { farmer: 15, wholesale: 25, retail: 35, trend: "stable", weekChange: 0 },
      carrots:  { farmer: 30, wholesale: 40, retail: 50, trend: "up", weekChange: +4 },
    }
  },
  {
    id: 2, city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.2090,
    prices: {
      tomatoes: { farmer: 22, wholesale: 32, retail: 42, trend: "up", weekChange: +6 },
      onions:   { farmer: 20, wholesale: 30, retail: 40, trend: "stable", weekChange: +1 },
      potatoes: { farmer: 18, wholesale: 28, retail: 38, trend: "down", weekChange: -3 },
      carrots:  { farmer: 28, wholesale: 38, retail: 48, trend: "up", weekChange: +5 },
    }
  },
  {
    id: 3, city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946,
    prices: {
      tomatoes: { farmer: 20, wholesale: 30, retail: 40, trend: "stable", weekChange: +2 },
      onions:   { farmer: 16, wholesale: 26, retail: 36, trend: "down", weekChange: -4 },
      potatoes: { farmer: 14, wholesale: 24, retail: 34, trend: "stable", weekChange: 0 },
      carrots:  { farmer: 26, wholesale: 36, retail: 46, trend: "up", weekChange: +3 },
    }
  },
  {
    id: 4, city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639,
    prices: {
      tomatoes: { farmer: 24, wholesale: 34, retail: 44, trend: "up", weekChange: +7 },
      onions:   { farmer: 19, wholesale: 29, retail: 39, trend: "stable", weekChange: +1 },
      potatoes: { farmer: 16, wholesale: 26, retail: 36, trend: "down", weekChange: -2 },
      carrots:  { farmer: 29, wholesale: 39, retail: 49, trend: "up", weekChange: +6 },
    }
  },
  {
    id: 5, city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707,
    prices: {
      tomatoes: { farmer: 23, wholesale: 33, retail: 43, trend: "stable", weekChange: +1 },
      onions:   { farmer: 17, wholesale: 27, retail: 37, trend: "down", weekChange: -6 },
      potatoes: { farmer: 17, wholesale: 27, retail: 37, trend: "stable", weekChange: 0 },
      carrots:  { farmer: 27, wholesale: 37, retail: 47, trend: "up", weekChange: +2 },
    }
  },
  {
    id: 6, city: "Pune", state: "Maharashtra", lat: 18.5204, lng: 73.8567,
    prices: {
      tomatoes: { farmer: 21, wholesale: 31, retail: 41, trend: "up", weekChange: +5 },
      onions:   { farmer: 15, wholesale: 25, retail: 35, trend: "down", weekChange: -3 },
      potatoes: { farmer: 13, wholesale: 23, retail: 33, trend: "stable", weekChange: 0 },
      carrots:  { farmer: 25, wholesale: 35, retail: 45, trend: "stable", weekChange: +1 },
    }
  },
  {
    id: 7, city: "Hyderabad", state: "Telangana", lat: 17.3850, lng: 78.4867,
    prices: {
      tomatoes: { farmer: 26, wholesale: 36, retail: 46, trend: "up", weekChange: +9 },
      onions:   { farmer: 21, wholesale: 31, retail: 41, trend: "up", weekChange: +3 },
      potatoes: { farmer: 19, wholesale: 29, retail: 39, trend: "down", weekChange: -1 },
      carrots:  { farmer: 31, wholesale: 41, retail: 51, trend: "up", weekChange: +7 },
    }
  },
  {
    id: 8, city: "Ahmedabad", state: "Gujarat", lat: 23.0225, lng: 72.5714,
    prices: {
      tomatoes: { farmer: 19, wholesale: 29, retail: 39, trend: "down", weekChange: -2 },
      onions:   { farmer: 14, wholesale: 24, retail: 34, trend: "down", weekChange: -7 },
      potatoes: { farmer: 12, wholesale: 22, retail: 32, trend: "stable", weekChange: 0 },
      carrots:  { farmer: 24, wholesale: 34, retail: 44, trend: "stable", weekChange: +1 },
    }
  },
]

const PRODUCE_OPTIONS = [
  { value: "tomatoes", label: "Tomatoes", icon: "🍅" },
  { value: "onions",   label: "Onions",   icon: "🧅" },
  { value: "potatoes", label: "Potatoes", icon: "🥔" },
  { value: "carrots",  label: "Carrots",  icon: "🥕" },
]

const AI_MARKET_INSIGHTS = {
  tomatoes: {
    summary: "Tomato prices are surging across metro markets due to early blight damage in Nashik and Pune supply belts. Expect prices to peak in 10–14 days before new arrivals stabilize supply.",
    signal: "sell_now",
    signals: [
      { icon: "🌧️", label: "Weather Impact", value: "Unseasonal rain in Nashik belt caused 18% crop loss. Supply tightened.", type: "warning" },
      { icon: "📦", label: "Arrival Data", value: "APMC Pune arrivals down 24% vs last week. Mumbai APMC also -19%.", type: "warning" },
      { icon: "📈", label: "Demand Signal", value: "Hotel & restaurant procurement up 12% ahead of summer season.", type: "positive" },
      { icon: "🏛️", label: "MSP Context", value: "Retail at ₹41–46/kg — well above floor. Good window for contract selling.", type: "positive" },
      { icon: "⚠️", label: "Risk", value: "Price correction likely in 3 weeks when Kolar and Chittoor supply enters.", type: "neutral" },
    ],
    bestCity: "Hyderabad",
    worstCity: "Ahmedabad",
    recommendation: "Sell within 7–10 days. Avoid storing — prices will correct when Karnataka harvest enters.",
    priceOutlook: "📈 Rising for 1–2 weeks, then correction",
  },
  onions: {
    summary: "Onion prices are softening across India driven by strong Nashik Kharif arrivals and reduced export demand from Bangladesh. Prices may dip further before stabilizing.",
    signal: "hold",
    signals: [
      { icon: "🏭", label: "Nashik Arrivals", value: "Record Kharif onion arrivals — 34% higher than last year at Lasalgaon.", type: "warning" },
      { icon: "🌍", label: "Export Demand", value: "Bangladesh import orders down 40% — domestic supply surplus rising.", type: "warning" },
      { icon: "🏛️", label: "Govt Action", value: "Export ban lifted but MEP at $550/tonne limiting actual exports.", type: "neutral" },
      { icon: "📉", label: "Storage Signal", value: "Cold storage occupancy at 78% — farmers holding stock, price pressure building.", type: "warning" },
      { icon: "💡", label: "Opportunity", value: "South Indian mandis (Chennai, Hyderabad) offering 8–12% premium vs North.", type: "positive" },
    ],
    bestCity: "Hyderabad",
    worstCity: "Ahmedabad",
    recommendation: "If stored, sell 40% now to reduce risk. Hold remainder for Rabi off-season premium (April–May window).",
    priceOutlook: "📉 Declining for 2–3 weeks",
  },
  potatoes: {
    summary: "Potato prices are stable with slight regional divergence. UP and Punjab harvests are on schedule keeping national supply balanced. No major disruption expected.",
    signal: "neutral",
    signals: [
      { icon: "🌾", label: "Harvest Status", value: "UP and Punjab Rabi potato harvest 95% complete — supply normal.", type: "positive" },
      { icon: "🧊", label: "Cold Storage", value: "Storage filling up. 60% of fresh harvest expected to go into cold storage.", type: "neutral" },
      { icon: "🏙️", label: "Urban Demand", value: "Stable QSR and processing demand. No spike expected.", type: "neutral" },
      { icon: "💡", label: "Price Opportunity", value: "Southern metros (Mumbai, Bangalore) paying ₹4–6/kg premium vs origin.", type: "positive" },
    ],
    bestCity: "Mumbai",
    worstCity: "Ahmedabad",
    recommendation: "Sell fresh to southern metro mandis for premium. Cold storage advisable only if targeting May–June off-season prices.",
    priceOutlook: "➡️ Stable for 3–4 weeks",
  },
  carrots: {
    summary: "Carrots seeing strong price appreciation driven by Ooty and Nilgiri supply constraints and rising health-food retail demand in metros. Good window for selling.",
    signal: "sell_now",
    signals: [
      { icon: "🌡️", label: "Weather", value: "Ooty and Kodaikanal facing unseasonal warmth — yield quality impacted.", type: "warning" },
      { icon: "🛒", label: "Retail Demand", value: "Health & organic retail channel demand up 22% YoY for carrots.", type: "positive" },
      { icon: "📍", label: "Regional Premium", value: "Hyderabad and Mumbai paying highest premiums currently.", type: "positive" },
      { icon: "⚠️", label: "Risk", value: "Punjab spring carrot harvest expected in 3 weeks — prices may soften.", type: "neutral" },
    ],
    bestCity: "Hyderabad",
    worstCity: "Ahmedabad",
    recommendation: "Route supply to Hyderabad or Mumbai mandis. Sell before Punjab spring harvest enters the market.",
    priceOutlook: "📈 Rising for 2–3 weeks",
  },
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPriceStats(data, produce) {
  const prices = data.map(d => d.prices[produce]?.retail || 0).filter(Boolean)
  if (!prices.length) return { min: 0, max: 0, avg: 0 }
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
  }
}

function getMargin(from, to) {
  if (!from || !to) return 0
  return ((to - from) / from * 100).toFixed(1)
}

function TrendBadge({ trend, change }) {
  if (trend === "up") return (
    <span className="flex items-center gap-1 text-red-600 text-xs font-bold">
      <ArrowUpRight className="w-3.5 h-3.5" /> +{change}%
    </span>
  )
  if (trend === "down") return (
    <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
      <ArrowDownRight className="w-3.5 h-3.5" /> {change}%
    </span>
  )
  return <span className="flex items-center gap-1 text-gray-400 text-xs font-bold"><Minus className="w-3.5 h-3.5" /> Stable</span>
}

// ── PriceOverlay ──────────────────────────────────────────────────────────────
function PriceOverlay({ map, priceData, selectedProduce, onLocationSelect }) {
  const markersRef = useRef([])

  useEffect(() => {
    if (!map || !priceData.length) return
    markersRef.current.forEach(m => m.setMap(null))

    const getColor = (price) => price <= 35 ? "#10B981" : price <= 43 ? "#F59E0B" : "#EF4444"

    const newMarkers = priceData.map(location => {
      const price = location.prices[selectedProduce]?.retail || 0
      const trend = location.prices[selectedProduce]?.trend
      
      const pinColor = getColor(price)
      
      const pinDiv = document.createElement("div")
      pinDiv.style.width = "28px"
      pinDiv.style.height = "28px"
      pinDiv.style.backgroundColor = pinColor
      pinDiv.style.borderRadius = "50%"
      pinDiv.style.border = "3px solid white"
      pinDiv.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)"

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: `${location.city} — ₹${price}/kg`,
        content: pinDiv,
      })

      const priceInfo = location.prices[selectedProduce]
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding:10px;min-width:200px;font-family:sans-serif">
            <div style="font-weight:800;font-size:14px;margin-bottom:6px">📍 ${location.city}, ${location.state}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px">
              <div style="color:#059669;font-weight:600">Farmer: ₹${priceInfo?.farmer}/kg</div>
              <div style="color:#D97706;font-weight:600">Wholesale: ₹${priceInfo?.wholesale}/kg</div>
              <div style="color:#DC2626;font-weight:600">Retail: ₹${priceInfo?.retail}/kg</div>
              <div style="color:#6B7280">Week: ${priceInfo?.weekChange > 0 ? "+" : ""}${priceInfo?.weekChange}%</div>
            </div>
            <div style="margin-top:8px;font-size:11px;color:#9CA3AF">Click for full analysis</div>
          </div>
        `,
      })

      marker.addListener("gmp-click", () => {
        infoWindow.open(map, marker)
        onLocationSelect(location)
      })

      return marker
    })

    markersRef.current = newMarkers
    return () => newMarkers.forEach(m => m.setMap(null))
  }, [map, priceData, selectedProduce])

  return null
}

// ── AI Market Insight Panel ───────────────────────────────────────────────────
function AIMarketInsight({ insight }) {
  const [expanded, setExpanded] = useState(true)
  if (!insight) return null

  const signalConfig = {
    sell_now: { label: "Sell Now", color: "bg-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    hold:     { label: "Hold Stock", color: "bg-amber-500",   bg: "bg-amber-50 border-amber-200" },
    neutral:  { label: "Monitor",   color: "bg-blue-500",    bg: "bg-blue-50 border-blue-200" },
  }
  const cfg = signalConfig[insight.signal]

  return (
    <Card className={`border ${cfg.bg} shadow-md`}>
      <CardContent className="p-5">
        {/* Header */}
        <div
          className="flex items-start justify-between cursor-pointer select-none"
          onClick={() => setExpanded(e => !e)}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <span className="text-sm font-bold text-gray-800">AI Market Analysis</span>
              <span className="text-xs text-gray-400 ml-2">Updated 15 min ago</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`${cfg.color} text-white text-xs font-bold px-3 py-1 rounded-full`}>
              {cfg.label}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        {/* Summary always visible */}
        <p className="text-sm text-gray-700 mt-3 leading-relaxed">{insight.summary}</p>

        {expanded && (
          <div className="space-y-4 mt-4">
            {/* Signal breakdown */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Why AI says this</p>
              <div className="space-y-2">
                {insight.signals.map((s, i) => (
                  <div key={i} className={`flex items-start gap-2.5 rounded-xl p-3 text-xs ${
                    s.type === "positive" ? "bg-emerald-50" :
                    s.type === "warning" ? "bg-red-50" : "bg-gray-50"
                  }`}>
                    <span className="text-base shrink-0">{s.icon}</span>
                    <div>
                      <span className={`font-bold ${
                        s.type === "positive" ? "text-emerald-700" :
                        s.type === "warning" ? "text-red-600" : "text-gray-600"
                      }`}>{s.label}: </span>
                      <span className="text-gray-600">{s.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Best / Worst market */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Best Market</div>
                <div className="font-bold text-emerald-700 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> {insight.bestCity}
                </div>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Lowest Rates</div>
                <div className="font-bold text-red-600 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" /> {insight.worstCity}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-wide">AI Recommendation</span>
              </div>
              <p className="text-sm text-white leading-relaxed">{insight.recommendation}</p>
              <div className="mt-2 text-xs text-gray-400">{insight.priceOutlook}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── Location Detail Card ──────────────────────────────────────────────────────
function PriceInfoCard({ location, selectedProduce, onClose }) {
  const priceInfo = location.prices[selectedProduce]

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900">{location.city}, {location.state}</h3>
            <TrendBadge trend={priceInfo?.trend} change={priceInfo?.weekChange} />
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 cursor-pointer">
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {/* Price chain */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: "Farmer Gets", value: priceInfo?.farmer, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Wholesale", value: priceInfo?.wholesale, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Retail", value: priceInfo?.retail, color: "text-red-700", bg: "bg-red-50" },
          ].map((p, i) => (
            <div key={i} className={`${p.bg} rounded-xl p-3 text-center`}>
              <div className={`text-xl font-black ${p.color}`}>₹{p.value}</div>
              <div className="text-[10px] text-gray-500 uppercase font-semibold mt-0.5">{p.label}</div>
              {i > 0 && (
                <div className="text-[10px] text-gray-400 mt-1">
                  +{getMargin(i === 1 ? priceInfo?.farmer : priceInfo?.wholesale, p.value)}% markup
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Margin warning */}
        {parseFloat(getMargin(priceInfo?.farmer, priceInfo?.retail)) > 60 && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3">
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">
              <span className="font-bold">High middleman margin detected.</span> Farmer receives only {(100 / (1 + parseFloat(getMargin(priceInfo?.farmer, priceInfo?.retail)) / 100)).toFixed(0)}% of retail price. Consider direct-to-market or FPO channels.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ── National Price Table ──────────────────────────────────────────────────────
function NationalPriceTable({ priceData, produce }) {
  const sorted = [...priceData].sort((a, b) =>
    (b.prices[produce]?.retail || 0) - (a.prices[produce]?.retail || 0)
  )

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <h4 className="font-bold text-gray-800 text-sm">National Price Comparison</h4>
        </div>
        <div className="space-y-2">
          {sorted.map((loc, i) => {
            const p = loc.prices[produce]
            const maxRetail = Math.max(...priceData.map(d => d.prices[produce]?.retail || 0))
            const pct = Math.round((p.retail / maxRetail) * 100)
            return (
              <div key={loc.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-700 w-24 truncate">{loc.city}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400">F: ₹{p.farmer}</span>
                    <span className="text-gray-400">W: ₹{p.wholesale}</span>
                    <span className="font-bold text-gray-800">R: ₹{p.retail}</span>
                    <TrendBadge trend={p.trend} change={p.weekChange} />
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${pct >= 90 ? "bg-red-400" : pct >= 70 ? "bg-amber-400" : "bg-emerald-400"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-gray-400">
          <span>F = Farmer &nbsp; W = Wholesale &nbsp; R = Retail</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Sidebar Controls ──────────────────────────────────────────────────────────
// ── Sidebar Controls ──────────────────────────────────────────────────────────
function MapSidebar({ selectedProduce, onProduceChange, priceData, produceOptions }) {
  const stats = getPriceStats(priceData, selectedProduce)

  return (
    <div className="space-y-4">
      {/* Produce Selector */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Produce</p>
          <div className="grid grid-cols-2 gap-2">
            {produceOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => onProduceChange(opt.value)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  selectedProduce === opt.value
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{opt.icon}</span> {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Stats */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">National Price Stats</p>
          {[
            { label: "Lowest Retail", value: `₹${stats.min}/kg`, color: "text-emerald-700", bg: "bg-emerald-50" },
            { label: "Highest Retail", value: `₹${stats.max}/kg`, color: "text-red-700", bg: "bg-red-50" },
            { label: "National Avg", value: `₹${stats.avg}/kg`, color: "text-blue-700", bg: "bg-blue-50" },
          ].map((s, i) => (
            <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl px-3 py-2.5`}>
              <span className="text-xs text-gray-600">{s.label}</span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4 space-y-2">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Map Legend</p>
          {[
            { color: "bg-emerald-500", label: "Low Price (≤₹35/kg)" },
            { color: "bg-amber-400", label: "Average (₹36–43/kg)" },
            { color: "bg-red-500", label: "High Price (≥₹44/kg)" },
          ].map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${l.color}`} />
              <span className="text-xs text-gray-600">{l.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MapSection() {
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [selectedProduce, setSelectedProduce] = useState("tomatoes")
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState("map") // "map" | "table"

  const [priceData, setPriceData] = useState(PRICE_DATA);
  const [produceOptions, setProduceOptions] = useState(PRODUCE_OPTIONS);
  const [insight, setInsight] = useState(AI_MARKET_INSIGHTS["tomatoes"]);

  useEffect(() => {
    setInsight(AI_MARKET_INSIGHTS[selectedProduce]);
  }, [selectedProduce]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    const initMap = async () => {
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 5,
        center: { lat: 20.5937, lng: 78.9629 },
        mapTypeId: "roadmap",
        disableDefaultUI: true,
        zoomControl: true,
        mapId: "DEMO_MAP_ID"
      })
      setMap(mapInstance)
    }

    if (window.google?.maps) { initMap(); return }
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&loading=async&libraries=marker`
    script.async = true
    script.defer = true
    window.initMap = initMap
    document.head.appendChild(script)
  }, [])

  const currentProduce = produceOptions.find(p => p.value === selectedProduce) || {
    value: selectedProduce,
    label: selectedProduce.charAt(0).toUpperCase() + selectedProduce.slice(1),
    icon: "🌾"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-700" />
            </div>
            Regional Price Intelligence
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            AI-analysed mandi prices across India · Live Contextual Data
          </p>
        </div>
        {/* View toggle */}
        <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
          {[{ id: "map", label: "🗺️ Map" }, { id: "table", label: "📊 Compare" }].map(v => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeView === v.id ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Market Insight — always on top */}
      <AIMarketInsight insight={insight} />

      {/* Main content */}
      <div className="grid lg:grid-cols-4 gap-5">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <MapSidebar
            selectedProduce={selectedProduce}
            onProduceChange={setSelectedProduce}
            priceData={priceData}
            produceOptions={produceOptions}
          />
        </div>

        {/* Map or Table */}
        <div className="lg:col-span-3 space-y-4">
          {activeView === "map" ? (
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    {currentProduce?.icon} {currentProduce?.label} Prices Across India
                  </h3>
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    {priceData.length} markets
                  </Badge>
                </div>
                <div className="relative">
                  <div ref={mapRef} className="w-full h-[440px] rounded-xl border border-gray-100" />
                  {map && !loading && (
                    <PriceOverlay
                      map={map}
                      priceData={priceData}
                      selectedProduce={selectedProduce}
                      onLocationSelect={setSelectedLocation}
                    />
                  )}
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-600 border-t-transparent mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Loading AI market data…</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">Click any marker to see detailed price breakdown</p>
              </CardContent>
            </Card>
          ) : (
            <NationalPriceTable priceData={priceData} produce={selectedProduce} />
          )}

          {/* Location Detail */}
          {selectedLocation && (
            <PriceInfoCard
              location={selectedLocation}
              selectedProduce={selectedProduce}
              onClose={() => setSelectedLocation(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}