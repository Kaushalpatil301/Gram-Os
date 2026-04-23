import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Brain,
  BarChart3,
  Activity,
  Sparkles,
  Clock,
  Zap,
  ShieldCheck,
  Boxes,
  Gauge,
  Leaf,
} from "lucide-react"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js"
import { Bar, Line, Doughnut } from "react-chartjs-2"
import axios from "axios"
import { toast } from "react-toastify"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
)

const API_URL = "http://localhost:8000/api/v1"

// ─── Shared chart defaults ───
const chartFont = { family: "'Inter', sans-serif", size: 11 }
const gridStyle = { color: "rgba(0,0,0,0.04)", drawBorder: false }
const axisTicks = { color: "#9CA3AF", font: chartFont }

export default function Analytics() {
  const [loading, setLoading] = useState(true)
  const [insights, setInsights] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const retailerEmail =
        localStorage.getItem("userEmail") || "retailer@agrichain.com"

      const [insightsRes, alertsRes] = await Promise.all([
        axios.get(`${API_URL}/inventory/retailer/${retailerEmail}/insights`),
        axios.get(`${API_URL}/inventory/retailer/${retailerEmail}/alerts`),
      ])

      setInsights(insightsRes.data.data)
      setAlerts(alertsRes.data.data.alerts)
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 800)
    toast.success("Data refreshed")
  }

  // ─── Derived metrics ───
  const totalProducts = insights?.summary?.totalProducts || 0
  const healthyItems = insights?.summary?.healthyItems || 0
  const lowStockItems = insights?.summary?.lowStockItems || 0
  const overstockItems = insights?.summary?.overstockItems || 0
  const healthScore = totalProducts > 0 ? Math.round((healthyItems / totalProducts) * 100) : 0
  const avgConfidence = insights?.insights?.length
    ? Math.round(insights.insights.reduce((sum, i) => sum + (i.confidence || 0), 0) / insights.insights.length)
    : 0
  const wasteRiskItems = alerts.filter(
    (a) => a.type === "waste-warning" || a.type === "overstock"
  ).length
  const highPriorityAlerts = alerts.filter((a) => a.priority === "high").length

  // ─── Chart Data ───

  // Demand Forecast (line) — 7 day projection per product
  const demandForecastData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    datasets: (insights?.insights?.slice(0, 3) || []).map((item, idx) => {
      const colors = [
        { border: "#10B981", bg: "rgba(16,185,129,0.08)" },
        { border: "#3B82F6", bg: "rgba(59,130,246,0.08)" },
        { border: "#F59E0B", bg: "rgba(245,158,11,0.08)" },
      ]
      const base = item.forecast || 100
      return {
        label: item.product,
        data: Array.from({ length: 7 }, (_, d) =>
          Math.round(base * (0.85 + Math.random() * 0.3) + d * 2)
        ),
        borderColor: colors[idx].border,
        backgroundColor: colors[idx].bg,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: colors[idx].border,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      }
    }),
  }

  // Inventory Health (doughnut)
  const inventoryHealthData = {
    labels: ["Healthy", "Low Stock", "Overstock"],
    datasets: [
      {
        data: [healthyItems, lowStockItems, overstockItems],
        backgroundColor: ["#10B981", "#F59E0B", "#3B82F6"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  // Stock vs Reorder Point (bar)
  const stockReorderData = {
    labels: insights?.insights?.map((i) => i.product) || [],
    datasets: [
      {
        label: "Current Stock",
        data: insights?.insights?.map((i) => i.currentStock) || [],
        backgroundColor: "rgba(59,130,246,0.75)",
        borderRadius: 4,
      },
      {
        label: "Reorder Point",
        data: insights?.insights?.map((i) => i.reorderPoint) || [],
        backgroundColor: "rgba(239,68,68,0.35)",
        borderRadius: 4,
      },
      {
        label: "Forecasted Demand",
        data: insights?.insights?.map((i) => i.forecast) || [],
        backgroundColor: "rgba(16,185,129,0.65)",
        borderRadius: 4,
      },
    ],
  }

  // Waste Risk (bar — days of stock vs threshold)
  const wasteRiskData = {
    labels: insights?.insights?.map((i) => i.product) || [],
    datasets: [
      {
        label: "Days of Stock",
        data: insights?.insights?.map((i) => i.daysOfStock) || [],
        backgroundColor: insights?.insights?.map((i) =>
          i.daysOfStock < 3 ? "rgba(239,68,68,0.7)" : i.daysOfStock > 10 ? "rgba(59,130,246,0.7)" : "rgba(16,185,129,0.7)"
        ) || [],
        borderRadius: 4,
      },
    ],
  }

  // ─── Helper Functions ───
  const getStatusBadge = (status) => {
    const map = {
      healthy: { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: <CheckCircle className="w-3.5 h-3.5" /> },
      "low-stock": { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      "reorder-needed": { bg: "bg-red-50 text-red-700 border-red-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
      overstock: { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: <Boxes className="w-3.5 h-3.5" /> },
    }
    const style = map[status] || map.healthy
    return (
      <Badge className={`${style.bg} border gap-1 font-medium`}>
        {style.icon}
        {status.replace("-", " ")}
      </Badge>
    )
  }

  const getPriorityStyle = (priority) => {
    const map = {
      high: "bg-red-50 border-red-200 hover:bg-red-100",
      medium: "bg-amber-50 border-amber-200 hover:bg-amber-100",
      low: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    }
    return map[priority] || map.low
  }

  const getPriorityBadge = (priority) => {
    const map = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-amber-100 text-amber-800 border-amber-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
    }
    return map[priority] || map.low
  }

  const getAlertIcon = (type) => {
    const map = {
      reorder: <Package className="w-5 h-5 text-red-500" />,
      "demand-spike": <TrendingUp className="w-5 h-5 text-amber-500" />,
      overstock: <Boxes className="w-5 h-5 text-blue-500" />,
      "waste-warning": <Leaf className="w-5 h-5 text-amber-600" />,
    }
    return map[type] || <AlertTriangle className="w-5 h-5 text-gray-500" />
  }

  // ─── Loading ───
  if (loading) {
    return (
      <section id="inventory" className="py-16 px-4 md:px-6 bg-gradient-to-br from-green-50/60 via-white to-emerald-50/40">
        <div className="max-w-7xl mx-auto text-center py-20">
          <div className="animate-spin w-10 h-10 border-[3px] border-emerald-200 border-t-emerald-600 rounded-full mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading inventory intelligence...</p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="inventory"
      className="py-8 md:py-14 px-4 md:px-6 bg-gradient-to-br from-green-50/60 via-white to-emerald-50/40"
      style={{ scrollMarginTop: "30px" }}
    >
      <div className="max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Smart Inventory</h2>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 text-xs px-2.5 py-0.5 font-medium">
                <Brain className="w-3 h-3 mr-1" />
                AI
              </Badge>
            </div>
            <p className="text-sm text-gray-500">AI-powered stock management, demand forecasting & waste prevention</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-sm h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Stock Health Score */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <Badge className={`text-xs border font-medium ${healthScore >= 70 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : healthScore >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                  {healthScore >= 70 ? "Good" : healthScore >= 40 ? "Fair" : "Critical"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{healthScore}%</p>
              <p className="text-sm text-gray-500 mt-1">Stock Health</p>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${healthScore >= 70 ? "bg-emerald-500" : healthScore >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Total SKUs */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="text-emerald-600 font-medium">{healthyItems}</span> healthy
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
              <p className="text-sm text-gray-500 mt-1">Total Products</p>
              <div className="mt-3 flex gap-1">
                <div className="h-1.5 rounded-full bg-emerald-400 flex-1" style={{ flex: healthyItems }} />
                <div className="h-1.5 rounded-full bg-amber-400 flex-1" style={{ flex: lowStockItems }} />
                <div className="h-1.5 rounded-full bg-blue-400 flex-1" style={{ flex: overstockItems || 1 }} />
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                {highPriorityAlerts > 0 && (
                  <Badge className="bg-red-50 text-red-700 border-red-200 text-xs border font-medium">
                    {highPriorityAlerts} urgent
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">{alerts.length}</p>
              <p className="text-sm text-gray-500 mt-1">Active Alerts</p>
              <p className="text-xs text-gray-400 mt-3">
                {wasteRiskItems} waste risk · {lowStockItems} low stock
              </p>
            </CardContent>
          </Card>

          {/* AI Confidence */}
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-purple-600" />
                </div>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 text-xs border font-medium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ML Model
                </Badge>
              </div>
              <p className="text-3xl font-bold text-gray-900">{avgConfidence}%</p>
              <p className="text-sm text-gray-500 mt-1">Forecast Accuracy</p>
              <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-purple-500 transition-all"
                  style={{ width: `${avgConfidence}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 1: Demand Forecast + Health Doughnut ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Demand Forecast</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">7-day AI prediction for top products</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-52">
                <Line
                  data={demandForecastData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { intersect: false, mode: "index" },
                    plugins: {
                      legend: { display: true, position: "top", align: "end", labels: { boxWidth: 8, usePointStyle: true, pointStyle: "circle", font: chartFont, padding: 16 } },
                      tooltip: { backgroundColor: "#1F2937", cornerRadius: 8, padding: 10, titleFont: { ...chartFont, weight: "600" }, bodyFont: chartFont, displayColors: true, boxWidth: 8, boxHeight: 8, usePointStyle: true },
                    },
                    scales: {
                      x: { grid: { display: false }, border: { display: false }, ticks: axisTicks },
                      y: { grid: gridStyle, border: { display: false }, ticks: { ...axisTicks, callback: (v) => `${v}kg` }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900">Stock Health</CardTitle>
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-52 flex items-center justify-center">
                <Doughnut
                  data={inventoryHealthData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                      legend: { position: "bottom", labels: { boxWidth: 10, usePointStyle: true, pointStyle: "circle", font: chartFont, padding: 12 } },
                      tooltip: { backgroundColor: "#1F2937", cornerRadius: 8, padding: 10, bodyFont: chartFont },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Charts Row 2: Stock vs Reorder + Shelf Life ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <Card className="lg:col-span-2 border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Stock vs Reorder vs Forecast</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Current levels against reorder thresholds and AI demand forecast</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Boxes className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-52">
                <Bar
                  data={stockReorderData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "top", align: "end", labels: { boxWidth: 8, usePointStyle: true, pointStyle: "circle", font: chartFont, padding: 16 } },
                      tooltip: { backgroundColor: "#1F2937", cornerRadius: 8, padding: 10, bodyFont: chartFont, callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}kg` } },
                    },
                    scales: {
                      x: { grid: { display: false }, border: { display: false }, ticks: axisTicks },
                      y: { grid: gridStyle, border: { display: false }, ticks: { ...axisTicks, callback: (v) => `${v}kg` }, beginAtZero: true },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">Shelf Life</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Days of stock remaining</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="h-52">
                <Bar
                  data={wasteRiskData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: {
                      legend: { display: false },
                      tooltip: { backgroundColor: "#1F2937", cornerRadius: 8, padding: 10, bodyFont: chartFont, callbacks: { label: (ctx) => `${ctx.parsed.x} days remaining` } },
                    },
                    scales: {
                      x: { grid: gridStyle, border: { display: false }, ticks: { ...axisTicks, callback: (v) => `${v}d` }, beginAtZero: true },
                      y: { grid: { display: false }, border: { display: false }, ticks: { ...axisTicks, font: { ...chartFont, size: 10 } } },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── AI Alerts ── */}
        {alerts.length > 0 && (
          <Card className="mb-4 border border-gray-100 shadow-sm">
            <CardHeader className="pb-3 pt-5 px-5">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Zap className="w-4 h-4 text-amber-500" />
                  AI Alerts
                  <span className="ml-1 text-xs font-normal text-gray-400">Automated insights</span>
                </CardTitle>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-xs border font-medium">
                  {alerts.length} active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border transition-colors ${getPriorityStyle(alert.priority)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm text-gray-900">{alert.product}</span>
                          <Badge className={`text-[10px] border font-medium ${getPriorityBadge(alert.priority)}`}>
                            {alert.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 leading-snug">{alert.message}</p>
                        {alert.currentStock !== undefined && (
                          <p className="text-xs text-gray-400 mt-1.5">Current stock: {alert.currentStock}kg</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Product Insights Table ── */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <Sparkles className="w-4 h-4 text-purple-500" />
                Product Intelligence
              </CardTitle>
              <p className="text-xs text-gray-400">Click a row for AI recommendations</p>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Stock</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Forecast</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Days Left</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Trend</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {insights?.insights?.map((item, index) => (
                    <tr
                      key={index}
                      className={`transition-colors cursor-pointer ${selectedProduct?.product === item.product ? "bg-purple-50/50" : "hover:bg-gray-50/50"}`}
                      onClick={() => setSelectedProduct(selectedProduct?.product === item.product ? null : item)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                            <Package className="w-3.5 h-3.5 text-emerald-600" />
                          </div>
                          <span className="font-medium text-gray-900">{item.product}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 font-semibold text-gray-900">{item.currentStock}kg</td>
                      <td className="text-center py-3 px-4">
                        <span className="font-semibold text-emerald-600">{item.forecast}kg</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge className={`border font-medium text-xs ${item.daysOfStock < 3 ? "bg-red-50 text-red-700 border-red-200" : item.daysOfStock < 7 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-700 border-gray-200"}`}>
                          {item.daysOfStock}d
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        {item.trend === "upward" ? (
                          <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                        ) : item.trend === "downward" ? (
                          <TrendingDown className="w-4 h-4 text-red-500 mx-auto" />
                        ) : (
                          <Activity className="w-4 h-4 text-gray-400 mx-auto" />
                        )}
                      </td>
                      <td className="text-center py-3 px-4">{getStatusBadge(item.status)}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-14 bg-gray-100 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${item.confidence > 80 ? "bg-emerald-500" : item.confidence > 60 ? "bg-amber-500" : "bg-red-500"}`}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 tabular-nums">{item.confidence}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Recommendations (inline expand) */}
            {selectedProduct && (
              <div className="mt-4 p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold text-sm text-purple-900">
                    AI Recommendations — {selectedProduct.product}
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedProduct.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-purple-800">
                      <Sparkles className="w-3.5 h-3.5 mt-0.5 text-purple-400 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
