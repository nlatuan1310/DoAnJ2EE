import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts"
import { AlertTriangle, TrendingUp, Wallet, Target, CalendarDays, AlertOctagon, BellRing } from "lucide-react"
import api from "@/services/api"

// --- Types ---
interface ForecastData {
  currentSpent: number
  budgetLimit: number
  forecast: number
  message: string
}

// --- Dữ liệu theo ngày (Thực tế vs Dự báo) ---
const dailyData = Array.from({ length: 24 }, (_, i) => {
  const day = i + 1
  const actual = Math.round((1500000 / 24) * day)
  const forecast = Math.round((1500000 / 24) * day * 1.05)
  return { day: `N${day}`, actual, forecast }
})

// --- Dữ liệu phân loại chi tiêu ---
const categoryData = [
  { name: "Ăn uống", amount: 650000, fill: "#6366f1" },
  { name: "Di chuyển", amount: 320000, fill: "#38bdf8" },
  { name: "Mua sắm", amount: 280000, fill: "#a78bfa" },
  { name: "Giải trí", amount: 150000, fill: "#34d399" },
  { name: "Khác", amount: 100000, fill: "#f472b6" },
]

// --- Formatter tiền VN ---
const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v)

// --- Component chính ---
export default function Dashboard() {
  const [data, setData] = useState<ForecastData>({
    currentSpent: 1500000,
    budgetLimit: 2000000,
    forecast: 1937500,
    message: "Cảnh báo: Bạn có thể vượt ngân sách!",
  })
  const [subs, setSubs] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([
    { type: 'Warning', message: 'Cảnh báo: Bạn đã dùng 75% ngân sách tháng này!' },
    { type: 'Info', message: 'Nhắc hẹn: Hóa đơn Netflix sẽ đến hạn sau 2 ngày.' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/smart/forecast")
      .then((res) => setData(res.data))
      .catch(() => {
        // Dùng dữ liệu mẫu nếu backend chưa chạy
      })
      .finally(() => setLoading(false))

    api.get("/smart/subscriptions")
      .then(res => setSubs(res.data))
      .catch(() => { })

    api.get("/smart/alerts")
      .then(res => setAlerts(res.data))
      .catch(() => { })
  }, [])

  const percent = Math.round((data.currentSpent / data.budgetLimit) * 100)
  const isOverBudget = data.forecast > data.budgetLimit

  const radialData = [
    {
      name: "Đã tiêu",
      value: percent,
      fill: isOverBudget ? "#f43f5e" : "#6366f1",
    },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Smart Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Dự báo chi tiêu thông minh - Tháng 03/2026</p>
        </div>
        {isOverBudget && (
          <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh báo vượt ngân sách!</span>
          </div>
        )}
      </div>

      {/* Nhiệm vụ 10: Smart Alerts Section */}
      <div className="mb-6 space-y-3">
        {alerts.map((alert, index) => (
          <div key={index} className={`flex items-center gap-3 p-4 rounded-lg border-l-4 animate-in slide-in-from-top-2 ${alert.type === 'Danger' ? 'bg-red-50 border-red-500 text-red-700' :
            alert.type === 'Warning' ? 'bg-amber-50 border-amber-500 text-amber-700' :
              'bg-blue-50 border-blue-500 text-blue-700'
            }`}>
            {alert.type === 'Danger' ? <AlertOctagon className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
            <span className="font-medium text-sm">{alert.message}</span>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* Đã tiêu */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardContent className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Đã tiêu</div>
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-indigo-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{loading ? "..." : fmtVND(data.currentSpent)}</div>
            <div className="mt-2 text-xs text-slate-500">Ngày 24 / 31 tháng này</div>
          </CardContent>
        </Card>

        {/* Ngân sách */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardContent className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Ngân sách</div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Target className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{loading ? "..." : fmtVND(data.budgetLimit)}</div>
            <div className="mt-2 text-xs text-slate-500">Giới hạn tháng 03/2026</div>
          </CardContent>
        </Card>

        {/* Dự báo cuối tháng */}
        <Card className={`border shadow-xs rounded-sm ${isOverBudget ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"}`}>
          <CardContent className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Dự báo cuối tháng</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isOverBudget ? "bg-rose-100" : "bg-sky-50"}`}>
                <TrendingUp className={`w-4 h-4 ${isOverBudget ? "text-rose-500" : "text-sky-500"}`} />
              </div>
            </div>
            <div className={`text-2xl font-bold ${isOverBudget ? "text-rose-600" : "text-slate-800"}`}>
              {loading ? "..." : fmtVND(data.forecast)}
            </div>
            <div className={`mt-2 text-xs ${isOverBudget ? "text-rose-500 font-medium" : "text-slate-500"}`}>
              {isOverBudget ? `⚠ Vượt ${fmtVND(data.forecast - data.budgetLimit)}` : "Ổn định trong ngân sách"}
            </div>
          </CardContent>
        </Card>

        {/* % Đã dùng */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardContent className="px-5 pt-5 pb-5">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-2">Tỷ lệ sử dụng</div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="60%"
                  outerRadius="100%"
                  data={radialData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "#f1f5f9" }} />
                  <Legend
                    iconSize={0}
                    content={() => (
                      <div className="flex justify-center mt-1">
                        <span className={`text-xl font-bold ${isOverBudget ? "text-rose-500" : "text-indigo-600"}`}>
                          {percent}%
                        </span>
                      </div>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Biểu đồ chính: Thực tế vs Dự báo */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Thực tế vs Dự báo theo ngày</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Công thức hồi quy: (Chi tiêu TB / Ngày) × Tổng ngày tháng</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block" />
                <span className="text-xs text-slate-600">Thực tế</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
                <span className="text-xs text-slate-600">Dự báo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
                <span className="text-xs text-slate-600">Giới hạn ngân sách</span>
              </div>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} barGap={2} barSize={8}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    interval={2}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}tr`}
                  />
                  <RechartsTooltip
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                    formatter={(value: number) => fmtVND(value)}
                    labelStyle={{ color: "#94a3b8", marginBottom: 4 }}
                  />
                  <ReferenceLine
                    y={data.budgetLimit}
                    stroke="#f43f5e"
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ value: "Ngân sách", fill: "#f43f5e", fontSize: 11, position: "right" }}
                  />
                  <Bar dataKey="actual" fill="#6366f1" radius={[3, 3, 0, 0]} name="Thực tế" />
                  <Bar dataKey="forecast" fill="#7dd3fc" radius={[3, 3, 0, 0]} name="Dự báo" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ phân loại */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Phân loại Chi tiêu</CardTitle>
            <p className="text-xs text-slate-400 mt-1">Tháng 03/2026</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3 mt-2">
              {categoryData.map((cat) => {
                const pct = Math.round((cat.amount / data.currentSpent) * 100)
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: cat.fill }}
                        />
                        <span className="text-sm text-slate-700">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{pct}%</span>
                        <span className="text-sm font-medium text-slate-700">{fmtVND(cat.amount)}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: cat.fill }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary box */}
            <div className={`mt-6 p-3 rounded-lg text-sm font-medium ${isOverBudget ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
              {loading ? "Đang tải..." : data.message}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription List */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-500" />
          Quản lý Hóa đơn định kỳ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subs.map((sub) => (
            <Card key={sub.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${sub.daysLeft <= 2 ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
                    }`}>
                    {sub.status}
                  </div>
                  <span className="text-xs text-slate-400">Còn {sub.daysLeft} ngày</span>
                </div>
                <h3 className="font-bold text-slate-700 text-lg">{sub.name}</h3>
                <p className="text-2xl font-black text-indigo-600 my-2">{fmtVND(sub.price)}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-dashed border-slate-200">
                  <span className="text-xs text-slate-500">Hạn: {sub.dueDate}</span>
                  <button className="text-xs font-semibold text-indigo-500 hover:underline">
                    Nhắc tôi 🔔
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
