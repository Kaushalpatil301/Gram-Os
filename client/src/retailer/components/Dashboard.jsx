import { useTranslation } from "../../consumer/i18n/config.jsx"
import { useTranslation } from "../../consumer/i18n/config.jsx"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { kpiData, activities } from "../lib/data"
import {
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
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
  Filler
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function Dashboard() {
  const { t } = useTranslation();

  const getIconComponent = (iconName) => {
    const icons = {
      Users,
      FileText,
      CreditCard,
      CheckCircle,
    }
    return icons[iconName] || Users
  }

  // Translated month and category labels
  const monthLabels = ["jan","feb","mar","apr","may","jun"].map(m => t(`months.${m}`))
  const categoryLabels = ["vegetables","fruits","grains","organic","dairy"].map(c => t(`retailer.dashboard.categories.${c}`))

  // Monthly Transactions Chart Data
  const monthlyTransactionsData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Transactions',
        data: [45000, 52000, 48000, 61000, 55000, 67000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  }

  const monthlyTransactionsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#374151',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#3B82F6',
        borderWidth: 1,
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6', drawBorder: false },
        border: { display: false },
        ticks: { 
          color: '#6B7280', 
          font: { size: 11 },
          callback: (value) => `$${(value / 1000)}k`,
        },
      },
    },
  }

  // Produce Categories Chart Data
  const produceCategoriesData = {
    labels: categoryLabels,
    datasets: [
      {
        label: 'Products',
        data: [45, 30, 15, 25, 18],
        backgroundColor: [
          '#22C55E',
          '#FB923C',
          '#A855F7',
          '#3B82F6',
          '#EC4899',
        ],
        borderRadius: 4,
        borderSkipped: false,
        barThickness: 24,
      },
    ],
  }

  const produceCategoriesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#374151',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 6,
        displayColors: false,
        callbacks: {
          label: (context) => `${context.parsed.y} products`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#F3F4F6', drawBorder: false },
        border: { display: false },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
    },
  }

  return (
    <section 
      id="dashboard" 
      className="py-16 px-6" 
      style={{ scrollMarginTop: '30px' }}
    >
      <div className="max-w-7xl mx-auto">

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {Object.entries(kpiData).map(([key, data]) => {
            const Icon = getIconComponent(data.icon)
            const isPositive = data.change.startsWith('+')
            
            return (
              <Card key={key} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className={`flex items-center space-x-1 text-sm font-medium ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{data.change}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{data.value}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {t(`retailer.dashboard.kpi.${key}`)}
                    </p>
                    {data.period && (
                      <p className="text-xs text-gray-500 mt-1">{t(data.period)}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
           {/* Monthly Transactions Chart */}
           <Card className="border-0 shadow-sm">
             <CardHeader className="pb-4">
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="text-lg font-semibold">{t("retailer.dashboard.charts.monthlyTransactions.title")}</CardTitle>
                   <p className="text-sm text-gray-600 mt-1">{t("retailer.dashboard.charts.monthlyTransactions.subtitle")}</p>
                 </div>
                 <div className="p-2 rounded-lg bg-blue-50">
                   <TrendingUp className="w-5 h-5 text-blue-600" />
                 </div>
               </div>
             </CardHeader>
             <CardContent>
               <div className="h-64">
                 <Line data={monthlyTransactionsData} options={monthlyTransactionsOptions} />
               </div>
             </CardContent>
           </Card>

           {/* Produce Categories Chart */}
           <Card className="border-0 shadow-sm">
             <CardHeader className="pb-4">
               <div className="flex items-center justify-between">
                 <div>
                   <CardTitle className="text-lg font-semibold">{t("retailer.dashboard.charts.produceCategories.title")}</CardTitle>
                   <p className="text-sm text-gray-600 mt-1">{t("retailer.dashboard.charts.produceCategories.subtitle")}</p>
                 </div>
                 <div className="p-2 rounded-lg bg-green-50">
                   <BarChart3 className="w-5 h-5 text-green-600" />
                 </div>
               </div>
             </CardHeader>
             <CardContent>
               <div className="h-64">
                 <Bar data={produceCategoriesData} options={produceCategoriesOptions} />
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">{t("retailer.dashboard.activity.title")}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{t("retailer.dashboard.activity.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id || index} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-2">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'contract' ? 'bg-blue-500' :
                      activity.type === 'payment' ? 'bg-green-500' :
                      activity.type === 'verification' ? 'bg-purple-500' :
                      'bg-yellow-500'
                    }`}></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">{t(activity.actionKey)}</p>
                      <Badge variant="secondary" className="text-xs">
                        {t(activity.timeKey, { count: activity.timeCount })}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{activity.farmer}</span>
                      {activity.detailsKey && (
                        <span className="text-gray-500"> • {t(activity.detailsKey, activity.detailsParams)}</span>
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
