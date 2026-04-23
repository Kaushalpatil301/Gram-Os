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
  Target,
  Users,
  FileText,
  CreditCard,
  ArrowUpRight,
  Leaf,
  Truck,
  Thermometer,
  CloudRain,
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

// ─── Static fallback data for AI smart inventory ───
const FALLBACK_INSIGHTS = {
  summary: {
    totalProducts: 38,
    healthyItems: 21,
    lowStockItems: 9,
    overstockItems: 5,
    expiringItems: 3,
  },
  insights: [
    {
      product: "Tomatoes",
      currentStock: 420,
      forecast: 610,
      daysOfStock: 4,
      trend: "upward",
      status: "low-stock",
      confidence: 91,
      recommendations: [
        "Demand spike expected this weekend due to local festival — reorder 300 kg by Thursday.",
        "Supplier 'Ravi Farms' has fresh batch available at ₹18/kg vs current ₹22/kg — switch for next order.",
        "Consider bundling with onions for combo offer to clear slow-moving onion stock.",
      ],
    },
    {
      product: "Onions",
      currentStock: 880,
      forecast: 310,
      daysOfStock: 14,
      trend: "downward",
      status: "overstock",
      confidence: 85,
      recommendations: [
        "Overstock detected — 570 kg surplus over 7-day demand. Risk of spoilage in 6 days.",
        "Run a flash discount (₹5/kg off) to accelerate turnover.",
        "Alert nearby kirana stores via WhatsApp broadcast for bulk pickup.",
      ],
    },
    {
      product: "Basmati Rice",
      currentStock: 1200,
      forecast: 980,
      daysOfStock: 9,
      trend: "stable",
      status: "healthy",
      confidence: 88,
      recommendations: [
        "Stock is healthy. Next reorder suggested in 6 days to avoid gap.",
        "Festival season approaching — consider pre-ordering extra 200 kg at bulk rate.",
      ],
    },
    {
      product: "Alphonso Mangoes",
      currentStock: 95,
      forecast: 320,
      daysOfStock: 2,
      trend: "upward",
      status: "reorder-needed",
      confidence: 94,
      recommendations: [
        "Critical: Only 2 days of stock remaining. Immediate reorder from Konkan supplier recommended.",
        "Peak season demand — mangoes selling 3x faster than last month.",
        "Price increase expected next week — bulk purchase now saves ~₹12/kg.",
      ],
    },
    {
      product: "Spinach",
      currentStock: 180,
      forecast: 145,
      daysOfStock: 7,
      trend: "stable",
      status: "healthy",
      confidence: 79,
      recommendations: [
        "Stock aligned with demand. Shelf life is 3 days — prioritize FIFO rotation.",
        "Weather forecast shows rain this week — delivery delay risk from hill farms. Keep buffer stock.",
      ],
    },
    {
      product: "Toor Dal",
      currentStock: 650,
      forecast: 700,
      daysOfStock: 6,
      trend: "upward",
      status: "low-stock",
      confidence: 83,
      recommendations: [
        "Demand rising steadily. Reorder 200 kg to maintain buffer.",
        "Government price support scheme active — lock in procurement now at subsidized rate.",
      ],
    },
  ],
}

const FALLBACK_ALERTS = [
  {
    id: 1,
    product: "Alphonso Mangoes",
    priority: "high",
    message:
      "Stock will run out in 2 days. Demand forecast shows 320 kg needed this week. Reorder immediately from Konkan supplier.",
    currentStock: 95,
  },
  {
    id: 2,
    product: "Tomatoes",
    priority: "high",
    message:
      "Weekend demand surge predicted (+45%). Current stock insufficient. AI recommends placing order with Ravi Farms today.",
    currentStock: 420,
  },
  {
    id: 3,
    product: "Onions",
    priority: "medium",
    message:
      "Overstock of ~570 kg detected. Shelf life window closing in 6 days. Consider discount pricing or bulk B2B sale.",
    currentStock: 880,
  },
  {
    id: 4,
    product: "Spinach",
    priority: "low",
    message:
      "Rain forecast this week may delay farm deliveries by 1–2 days. Maintain small buffer to avoid stockout.",
    currentStock: 180,
  },
]

const RECENT_ACTIVITIES = [
  {
    id: 1,
    type: "reorder",
    action: "Auto-reorder suggested",
    farmer: "Ravi Farms, Nashik",
    details: "300 kg Tomatoes @ ₹18/kg",
    time: "12 min ago",
  },
  {
    id: 2,
    type: "payment",
    action: "Payment released",
    farmer: "Suresh Organic Farms",
    details: "₹14,400 for 80 kg Spinach batch",
    time: "1 hr ago",
  },
  {
    id: 3,
    type: "contract",
    action: "New supply contract signed",
    farmer: "Konkan Mango Growers Co-op",
    details: "500 kg Alphonso Mangoes, weekly delivery",
    time: "3 hr ago",
  },
  {
    id: 4,
    type: "verification",
    action: "Quality check passed",
    farmer: "Ganesh Rice Mill, Kolhapur",
    details: "1200 kg Basmati Rice — Grade A certified",
    time: "5 hr ago",
  },
  {
    id: 5,
    type: "alert",
    action: "AI spoilage warning issued",
    farmer: "Internal system",
    details: "Onion batch #ON-447 flagged for accelerated turnover",
    time: "7 hr ago",
  },
]

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
      // Use fallback data when API is unavailable
      setInsights(FALLBACK_INSIGHTS)
      setAlerts(FALLBACK_ALERTS)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setTimeout(() => setRefreshing(false), 1000)
    toast.success("Smart Inventory refreshed!")
  }

  // ─── Helper functions ───
  const getStatusColor = (status) => {
    const colors = {
      healthy: "bg-green-100 text-green-800 border-green-200",
      "low-stock": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "reorder-needed": "bg-red-100 text-red-800 border-red-200",
      overstock: "bg-blue-100 text-blue-800 border-blue-200",
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusIcon = (status) => {
    const icons = {
      healthy: <CheckCircle className="w-4 h-4" />,
      "low-stock": <AlertTriangle className="w-4 h-4" />,
      "reorder-needed": <AlertTriangle className="w-4 h-4" />,
      overstock: <Package className="w-4 h-4" />,
    }
    return icons[status] || <Package className="w-4 h-4" />
  }

  const getTrendIcon = (trend) => {
    if (trend === "upward")
      return <TrendingUp className="w-4 h-4 text-green-600" />
    if (trend === "downward")
      return <TrendingDown className="w-4 h-4 text-red-600" />
    return <Activity className="w-4 h-4 text-gray-600" />
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-300",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
      low: "bg-blue-100 text-blue-800 border-blue-300",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  }

  // ─── Chart Data ───

  // Weekly Produce Procurement Cost
  const monthlyTransactionsData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Procurement Cost (₹)",
        data: [8200, 11400, 9600, 14800, 13200, 19500, 16700],
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.08)",
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#374151",
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#6B7280", font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6", drawBorder: false },
        border: { display: false },
        ticks: {
          color: "#6B7280",
          font: { size: 11 },
          callback: (v) => `₹${v / 1000}k`,
        },
      },
    },
  }

  // Produce Categories by SKU count
  const produceCategoriesData = {
    labels: ["Vegetables", "Fruits", "Pulses & Grains", "Dairy", "Spices"],
    datasets: [
      {
        label: "SKUs",
        data: [14, 8, 7, 5, 4],
        backgroundColor: [
          "#16a34a",
          "#f97316",
          "#7c3aed",
          "#0ea5e9",
          "#dc2626",
        ],
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 24,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#374151",
        cornerRadius: 6,
        displayColors: false,
        callbacks: { label: (ctx) => `${ctx.parsed.y} SKUs` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: "#6B7280", font: { size: 10 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#F3F4F6", drawBorder: false },
        border: { display: false },
        ticks: { color: "#6B7280", font: { size: 10 } },
      },
    },
  }

  // Inventory Status Doughnut
  const inventoryStatusData = {
    labels: ["Healthy", "Low Stock", "Reorder Needed", "Overstock"],
    datasets: [
      {
        data: [
          insights?.summary?.healthyItems || 0,
          insights?.summary?.lowStockItems || 0,
          insights?.summary?.expiringItems || 0,
          insights?.summary?.overstockItems || 0,
        ],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"],
        borderWidth: 0,
      },
    ],
  }

  // Stock vs AI Demand Forecast
  const forecastComparisonData = {
    labels: insights?.insights?.slice(0, 6).map((i) => i.product) || [],
    datasets: [
      {
        label: "Current Stock (kg)",
        data: insights?.insights?.slice(0, 6).map((i) => i.currentStock) || [],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
      },
      {
        label: "7-Day AI Forecast (kg)",
        data: insights?.insights?.slice(0, 6).map((i) => i.forecast) || [],
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  }

  // ─── KPI metrics ───
  const kpiMetrics = [
    {
      label: "Total SKUs",
      value: insights?.summary?.totalProducts || 0,
      icon: Package,
      color: "bg-emerald-100 text-emerald-600",
      borderColor: "border-l-emerald-500",
    },
    {
      label: "Healthy Stock",
      value: insights?.summary?.healthyItems || 0,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
      borderColor: "border-l-green-500",
    },
    {
      label: "Low Stock Items",
      value: insights?.summary?.lowStockItems || 0,
      icon: AlertTriangle,
      color: "bg-red-100 text-red-600",
      borderColor: "border-l-red-500",
    },
    {
      label: "Linked Farmers",
      value: 24,
      icon: Users,
      change: "+3 this week",
      color: "bg-blue-100 text-blue-600",
      borderColor: "border-l-blue-500",
    },
    {
      label: "Active Contracts",
      value: 11,
      icon: FileText,
      change: "+2 this month",
      color: "bg-purple-100 text-purple-600",
      borderColor: "border-l-purple-500",
    },
    {
      label: "Pending Payments",
      value: "₹38.4k",
      icon: CreditCard,
      change: "3 invoices",
      color: "bg-amber-100 text-amber-600",
      borderColor: "border-l-amber-500",
    },
  ]

  // ─── Loading State ───
  if (loading) {
    return (
      <section id="analytics" className="py-16 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto" />
          <p className="mt-4 text-gray-600">Loading smart inventory...</p>
        </div>
      </section>
    )
  }

  // ─── Render ───
  return (
    <section
      id="analytics"
      className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12 border border-green-100"
      style={{ scrollMarginTop: "30px" }}
    >
      <div className="p-6 md:p-10">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">Smart Inventory</h2>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                <Brain className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <p className="text-gray-600">
              Farm supply intelligence, demand forecasting & spoilage prevention
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm rounded-xl px-5 py-5 transition-all font-semibold flex items-center h-auto"
          >
            <RefreshCw
              className={`w-5 h-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh Data
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {kpiMetrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Card
                key={metric.label}
                className={`border-l-4 ${metric.borderColor} hover:shadow-lg transition-shadow`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${metric.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {metric.change && (
                      <span className="text-xs font-medium text-green-600 flex items-center">
                        <ArrowUpRight className="w-3 h-3" />
                        {metric.change}
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ── Charts Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Procurement Cost */}
          <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">
                    Weekly Procurement Cost
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Daily farm procurement spend this week
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Line
                  data={monthlyTransactionsData}
                  options={lineChartOptions}
                />
              </div>
            </CardContent>
          </Card>

          {/* Inventory Status Doughnut */}
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Stock Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Doughnut
                  data={inventoryStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: { boxWidth: 12, font: { size: 10 } },
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stock vs AI Forecast */}
          <Card className="lg:col-span-2 border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-emerald-600" />
                Stock vs 7-Day AI Demand Forecast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Bar
                  data={forecastComparisonData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: "top" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { font: { size: 10 } },
                      },
                      x: { ticks: { font: { size: 10 } } },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produce Category Mix */}
          <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                  Produce Mix
                </CardTitle>
                <div className="p-2 rounded-lg bg-green-50">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <Bar
                  data={produceCategoriesData}
                  options={barChartOptions}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── AI Alerts ── */}
        {alerts.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                AI-Powered Inventory Alerts
                <Badge className="ml-2 bg-orange-500 text-white">
                  {alerts.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)} flex items-start gap-3 hover:shadow-md transition-shadow`}
                  >
                    <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{alert.product}</span>
                        <Badge
                          className={`text-xs ${getPriorityColor(alert.priority)}`}
                        >
                          {alert.priority.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700">{alert.message}</p>
                      {alert.currentStock && (
                        <p className="text-xs text-gray-600 mt-1">
                          Current: {alert.currentStock} kg
                        </p>
                      )}
                    </div>
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Product Insights Table ── */}
        <Card className="mb-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Product-Level AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 text-sm font-semibold">
                      Produce
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      Stock (kg)
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      7-Day Demand
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      Days Left
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      Demand Trend
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      Status
                    </th>
                    <th className="text-center p-3 text-sm font-semibold">
                      AI Confidence
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {insights?.insights?.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedProduct(item)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Leaf className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{item.product}</span>
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <span className="font-semibold">
                          {item.currentStock} kg
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <span className="text-emerald-600 font-semibold">
                          {item.forecast} kg
                        </span>
                      </td>
                      <td className="text-center p-3">
                        <Badge
                          className={
                            item.daysOfStock < 3
                              ? "bg-red-100 text-red-800"
                              : item.daysOfStock < 5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {item.daysOfStock}d
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        <div className="flex justify-center">
                          {getTrendIcon(item.trend)}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Badge className={getStatusColor(item.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(item.status)}
                            {item.status.replace("-", " ")}
                          </span>
                        </Badge>
                      </td>
                      <td className="text-center p-3">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                item.confidence > 80
                                  ? "bg-green-500"
                                  : item.confidence > 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${item.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600">
                            {item.confidence}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── AI Recommendations Panel ── */}
        {selectedProduct && (
          <Card className="mb-8 border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                AI Recommendations — {selectedProduct.product}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedProduct.recommendations?.map((rec, index) => (
                  <div
                    key={index}
                    className="p-3 bg-purple-50 rounded-lg border border-purple-200"
                  >
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
                <Button
                  onClick={() => setSelectedProduct(null)}
                  className="mt-4 w-full bg-purple-600 hover:bg-purple-700"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Recent Activity ── */}
        <Card className="border-0 shadow-sm hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Recent Activity
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Latest updates from your farm supply network
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {RECENT_ACTIVITIES.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 mt-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        activity.type === "contract"
                          ? "bg-blue-500"
                          : activity.type === "payment"
                          ? "bg-green-500"
                          : activity.type === "verification"
                          ? "bg-purple-500"
                          : activity.type === "reorder"
                          ? "bg-emerald-500"
                          : "bg-orange-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {activity.time}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{activity.farmer}</span>
                      {activity.details && (
                        <span className="text-gray-500">
                          {" "}
                          • {activity.details}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}