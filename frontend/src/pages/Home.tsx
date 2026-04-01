import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Loader2, BellRing, AlertOctagon, Wallet, TrendingDown, PiggyBank } from "lucide-react"

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

import { viTienApi, thongKeApi, thongBaoApi } from "@/services/api"

// VND formatter
const fmtVND = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(v)

const fmtCompact = (v: number) => {
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}tr`
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`
  return v.toString()
}

// Lấy khoảng thời gian đầu tháng → hiện tại
function getMonthRange(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19),
    label: `Tháng ${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
  }
}

// Lấy khoảng 7 ngày gần nhất
function getLast7DaysRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - 6)
  start.setHours(0, 0, 0, 0)
  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19),
  }
}

// Lấy khoảng tháng trước
function getLastMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  return {
    start: start.toISOString().slice(0, 19),
    end: end.toISOString().slice(0, 19),
  }
}

const PIE_COLORS = ["#6366f1", "#38bdf8", "#1e1b4b", "#c4b5fd", "#f472b6", "#34d399", "#f59e0b", "#ef4444"]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [monthlySpending, setMonthlySpending] = useState(0)
  const [lastMonthSpending, setLastMonthSpending] = useState(0)
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [sparkData, setSparkData] = useState<{ v: number }[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [monthLabel, setMonthLabel] = useState("")

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const thisMonth = getMonthRange()
      const lastMonth = getLastMonthRange()
      const last7Days = getLast7DaysRange()
      setMonthLabel(thisMonth.label)

      const [walletsRes, catStatsRes, lastMonthCatRes, trendRes, alertsRes] = await Promise.allSettled([
        viTienApi.getAll(),
        thongKeApi.getCategoryStats(thisMonth.start, thisMonth.end),
        thongKeApi.getCategoryStats(lastMonth.start, lastMonth.end),
        thongKeApi.getTrend(last7Days.start, last7Days.end),
        thongBaoApi.getAll(),
      ])

      // 1. Tổng Số Dư
      if (walletsRes.status === "fulfilled") {
        const wallets = walletsRes.value.data || []
        const total = wallets.reduce((sum: number, w: any) => sum + (w.soDu || 0), 0)
        setTotalBalance(total)
      }

      // 2. Chi tiêu tháng này (category stats)
      if (catStatsRes.status === "fulfilled") {
        const catStats = catStatsRes.value.data || []
        setCategoryData(catStats)
        const totalSpent = catStats.reduce((sum: number, c: any) => sum + (c.tongTien || 0), 0)
        setMonthlySpending(totalSpent)
      }

      // 3. Chi tiêu tháng trước (để tính %)
      if (lastMonthCatRes.status === "fulfilled") {
        const lastCats = lastMonthCatRes.value.data || []
        const lastTotal = lastCats.reduce((sum: number, c: any) => sum + (c.tongTien || 0), 0)
        setLastMonthSpending(lastTotal)
      }

      // 4. Xu hướng 7 ngày
      if (trendRes.status === "fulfilled") {
        const rawTrend = trendRes.value.data || []
        const transformed = rawTrend.map((item: any) => ({
          date: new Date(item[0]).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
          amount: item[1] || 0,
        }))
        setTrendData(transformed)
        // Sparkline: dùng cùng data trend
        setSparkData(transformed.map((t: any) => ({ v: t.amount })))
      }

      // 5. Thông báo / Cảnh báo
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
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Dashboard:", err)
    } finally {
      setLoading(false)
    }
  }

  // Tính % thay đổi chi tiêu so với tháng trước
  const spendingChange = lastMonthSpending > 0
    ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100
    : 0

  const savings = totalBalance > 0 ? Math.max(0, totalBalance - monthlySpending) : 0

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-violet-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Đang tải dữ liệu...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
          <p className="text-sm text-slate-500">{monthLabel} — Tổng quan tài chính</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
            <div key={index} className={`flex items-center gap-3 p-4 rounded-lg border-l-4 animate-in slide-in-from-top-2 ${
              alert.type === "Danger" ? "bg-red-50 border-red-500 text-red-700" :
              alert.type === "Warning" ? "bg-amber-50 border-amber-500 text-amber-700" :
              "bg-blue-50 border-blue-500 text-blue-700"
            }`}>
              {alert.type === "Danger" ? <AlertOctagon className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
              <span className="font-medium text-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards — 3 cards, chỉ sparkline cho Chi Tiêu */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {/* Card 1 — Tổng Số Dư */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Tổng Số Dư</CardTitle>
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-indigo-500" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">SỐ DƯ</div>
            <div className="text-3xl font-bold text-slate-800">{fmtVND(totalBalance)}</div>
            <div className="mt-2 text-xs text-slate-500">Tổng cộng tất cả ví</div>
          </CardContent>
        </Card>

        {/* Card 2 — Chi Tiêu Tháng + Sparkline */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Chi Tiêu Tháng</CardTitle>
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-500" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-1">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">CHI TIÊU</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-slate-800">{fmtVND(monthlySpending)}</span>
              {spendingChange !== 0 && (
                <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${
                  spendingChange > 0 ? "text-rose-500 bg-rose-50" : "text-emerald-500 bg-emerald-50"
                }`}>
                  {spendingChange > 0 ? "+" : ""}{spendingChange.toFixed(0)}%
                </span>
              )}
            </div>
            {sparkData.length > 0 && (
              <div className="h-[80px] -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData}>
                    <defs>
                      <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card 3 — Tiết Kiệm */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Còn lại</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <PiggyBank className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">SỐ DƯ - CHI TIÊU</div>
            <div className="text-3xl font-bold text-slate-800">{fmtVND(savings)}</div>
            <div className="mt-2 text-xs text-slate-500">Ước tính còn lại {monthLabel}</div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row — Donut Chart + Xu hướng 7 ngày */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Phân loại Chi tiêu — Donut Chart */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Phân loại Chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {categoryData.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">Chưa có dữ liệu chi tiêu trong tháng này.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full h-[300px] flex justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="45%"
                        innerRadius={75}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="tongTien"
                        nameKey="tenDanhMuc"
                        stroke="none"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.mauSac || PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                        formatter={(value: number) => fmtVND(value)}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-sm text-slate-600 ml-1">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Xu hướng Chi tiêu 7 ngày — Line Chart */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Xu hướng Chi tiêu 7 ngày</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {trendData.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">Chưa có dữ liệu xu hướng.</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      tickFormatter={(v) => fmtCompact(v)}
                    />
                    <RechartsTooltip
                      contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                      formatter={(value: number) => fmtVND(value)}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1", strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
