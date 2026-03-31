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
import { AlertTriangle, TrendingUp, Wallet, Target, CalendarDays, AlertOctagon, BellRing, Loader2 } from "lucide-react"
import { thongKeApi, nganSachApi, thongBaoApi, dangKyDichVuApi } from "@/services/api"

// --- Formatter tiền VN ---
const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v)

// Helper lấy khoảng thời gian tháng hiện tại
function getThisMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19),
    totalDays: end.getDate(),
    currentDay: now.getDate(),
    label: `Tháng ${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`
  }
}

// --- Component chính ---
export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [currentSpent, setCurrentSpent] = useState(0)
  const [budgetLimit, setBudgetLimit] = useState(0)
  const [forecast, setForecast] = useState(0)
  const [forecastMessage, setForecastMessage] = useState("")
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [dailyData, setDailyData] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [monthInfo, setMonthInfo] = useState({ totalDays: 30, currentDay: 1, label: "" })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      const month = getThisMonthRange()
      setMonthInfo({ totalDays: month.totalDays, currentDay: month.currentDay, label: month.label })

      const [catRes, trendRes, budgetRes, alertsRes, subsRes] = await Promise.allSettled([
        thongKeApi.getCategoryStats(month.start, month.end),
        thongKeApi.getTrend(month.start, month.end),
        nganSachApi.getAll(),
        thongBaoApi.getAll(),
        dangKyDichVuApi.getAll(),
      ])

      // 1. Category Stats → categoryData + totalSpent
      let totalSpent = 0
      if (catRes.status === "fulfilled") {
        const cats = catRes.value.data || []
        setCategoryData(cats)
        totalSpent = cats.reduce((sum: number, c: any) => sum + (c.tongTien || 0), 0)
        setCurrentSpent(totalSpent)
      }

      // 2. Trend → dailyData (thực tế vs dự báo)
      if (trendRes.status === "fulfilled") {
        const rawTrend = trendRes.value.data || []
        const transformed = rawTrend.map((item: any, idx: number) => {
          const day = idx + 1
          const actualAccum = rawTrend.slice(0, idx + 1).reduce((s: number, r: any) => s + (r[1] || 0), 0)
          const avgPerDay = totalSpent / Math.max(month.currentDay, 1)
          const forecastAccum = Math.round(avgPerDay * day)
          return {
            day: `N${new Date(item[0]).getDate()}`,
            actual: actualAccum,
            forecast: forecastAccum,
          }
        })
        setDailyData(transformed)
      }

      // 3. Budget → tổng giới hạn ngân sách tháng này
      let totalBudget = 0
      if (budgetRes.status === "fulfilled") {
        const budgets = budgetRes.value.data || []
        totalBudget = budgets.reduce((sum: number, b: any) => sum + (b.gioiHanTien || 0), 0)
        setBudgetLimit(totalBudget)
      }

      // 4. Tính forecast
      const avgPerDay = totalSpent / Math.max(month.currentDay, 1)
      const forecastValue = Math.round(avgPerDay * month.totalDays)
      setForecast(forecastValue)
      if (totalBudget > 0 && forecastValue > totalBudget) {
        setForecastMessage(`Cảnh báo: Dự báo chi tiêu cuối tháng vượt ngân sách ${fmtVND(forecastValue - totalBudget)}!`)
      } else if (totalBudget > 0) {
        setForecastMessage("Ổn định: Chi tiêu dự kiến nằm trong ngân sách.")
      } else {
        setForecastMessage("Chưa thiết lập ngân sách. Hãy tạo ngân sách để theo dõi.")
      }

      // 5. Alerts
      if (alertsRes.status === "fulfilled") {
        const rawAlerts = alertsRes.value.data || []
        setAlerts(
          rawAlerts
            .filter((a: any) => !a.daDoc)
            .slice(0, 5)
            .map((a: any) => ({
              type: a.loai === "BUDGET_EXCEEDED" ? "Danger" : a.loai === "WARNING" ? "Warning" : "Info",
              message: a.noiDung || a.tieuDe || "Thông báo mới",
            }))
        )
      }

      // 6. Subscriptions
      if (subsRes.status === "fulfilled") {
        const rawSubs = subsRes.value.data || []
        setSubs(rawSubs.map((s: any) => {
          const nextDate = s.ngayThanhToanTiepTheo ? new Date(s.ngayThanhToanTiepTheo) : null
          const daysLeft = nextDate ? Math.max(0, Math.ceil((nextDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0
          return {
            id: s.id,
            name: s.tenDichVu || s.moTa || "Dịch vụ",
            price: s.soTien || 0,
            dueDate: nextDate ? nextDate.toLocaleDateString("vi-VN") : "—",
            daysLeft,
            status: daysLeft <= 2 ? "SẮP ĐẾN HẠN" : "ĐANG HOẠT ĐỘNG",
          }
        }))
      }
    } catch (err) {
      console.error("Lỗi tải Smart Dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  const percent = budgetLimit > 0 ? Math.round((currentSpent / budgetLimit) * 100) : 0
  const isOverBudget = budgetLimit > 0 && forecast > budgetLimit

  const radialData = [
    {
      name: "Đã tiêu",
      value: Math.min(percent, 100),
      fill: isOverBudget ? "#f43f5e" : "#6366f1",
    },
  ]

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Đang tải Smart Dashboard...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Smart Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Dự báo chi tiêu thông minh — {monthInfo.label}</p>
        </div>
        {isOverBudget && (
          <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium px-4 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Cảnh báo vượt ngân sách!</span>
          </div>
        )}
      </div>

      {/* Smart Alerts Section */}
      {alerts.length > 0 && (
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
      )}

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
            <div className="text-2xl font-bold text-slate-800">{fmtVND(currentSpent)}</div>
            <div className="mt-2 text-xs text-slate-500">Ngày {monthInfo.currentDay} / {monthInfo.totalDays} tháng này</div>
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
            <div className="text-2xl font-bold text-slate-800">{budgetLimit > 0 ? fmtVND(budgetLimit) : "Chưa đặt"}</div>
            <div className="mt-2 text-xs text-slate-500">Giới hạn {monthInfo.label}</div>
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
              {fmtVND(forecast)}
            </div>
            <div className={`mt-2 text-xs ${isOverBudget ? "text-rose-500 font-medium" : "text-slate-500"}`}>
              {isOverBudget ? `⚠ Vượt ${fmtVND(forecast - budgetLimit)}` : "Ổn định trong ngân sách"}
            </div>
          </CardContent>
        </Card>

        {/* % Đã dùng */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardContent className="px-5 pt-5 pb-5">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-2">Tỷ lệ sử dụng</div>
            {budgetLimit > 0 ? (
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
            ) : (
              <div className="h-[100px] flex items-center justify-center">
                <p className="text-sm text-slate-400">Chưa có ngân sách</p>
              </div>
            )}
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
              {budgetLimit > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block" />
                  <span className="text-xs text-slate-600">Giới hạn ngân sách</span>
                </div>
              )}
            </div>
            <div className="h-[280px]">
              {dailyData.length > 0 ? (
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
                    {budgetLimit > 0 && (
                      <ReferenceLine
                        y={budgetLimit}
                        stroke="#f43f5e"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{ value: "Ngân sách", fill: "#f43f5e", fontSize: 11, position: "right" }}
                      />
                    )}
                    <Bar dataKey="actual" fill="#6366f1" radius={[3, 3, 0, 0]} name="Thực tế" />
                    <Bar dataKey="forecast" fill="#7dd3fc" radius={[3, 3, 0, 0]} name="Dự báo" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Chưa có dữ liệu giao dịch trong tháng này.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Biểu đồ phân loại */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-2">
            <CardTitle className="text-base font-semibold text-slate-800">Phân loại Chi tiêu</CardTitle>
            <p className="text-xs text-slate-400 mt-1">{monthInfo.label}</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">Chưa có dữ liệu.</div>
            ) : (
              <div className="space-y-3 mt-2">
                {categoryData.map((cat: any) => {
                  const pct = currentSpent > 0 ? Math.round((cat.tongTien / currentSpent) * 100) : 0
                  return (
                    <div key={cat.danhMucId || cat.tenDanhMuc}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: cat.mauSac || "#6366f1" }}
                          />
                          <span className="text-sm text-slate-700">{cat.tenDanhMuc}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">{pct}%</span>
                          <span className="text-sm font-medium text-slate-700">{fmtVND(cat.tongTien)}</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: cat.mauSac || "#6366f1" }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Summary box */}
            <div className={`mt-6 p-3 rounded-lg text-sm font-medium ${isOverBudget ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
              {forecastMessage}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription List */}
      {subs.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            Quản lý Hóa đơn định kỳ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subs.map((sub: any) => (
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
