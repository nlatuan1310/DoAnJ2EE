import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Target,
  ArrowLeft,
  TrendingUp,
  Calendar,
  Wallet,
  Trash2,
  Clock,
  Pencil,
  Loader2,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts"
import ContributionModal from "@/components/goals/ContributionModal"
import GoalFormModal from "@/components/goals/GoalFormModal"
import type { SavingGoal } from "@/components/goals/GoalCard"
import type { GoalFormData } from "@/components/goals/GoalFormModal"
import * as goalService from "@/services/goalService"

interface Contribution {
  id: string
  soTien: number
  ngayTao: string
  ghiChu?: string
}

// Tạo dữ liệu biểu đồ tích lũy
function buildChartData(contributions: Contribution[]) {
  let cumulative = 0
  return contributions.map((c) => {
    cumulative += c.soTien
    const date = new Date(c.ngayTao)
    return {
      date: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
      tichLuy: cumulative,
      dongGop: c.soTien,
    }
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDaysRemaining(dateStr: string): number {
  const target = new Date(dateStr)
  const today = new Date()
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

const goalColorMap: Record<string, { from: string; to: string; bg: string; text: string }> = {
  violet: { from: "from-violet-500", to: "to-violet-400", bg: "bg-violet-50", text: "text-violet-500" },
  emerald: { from: "from-emerald-500", to: "to-emerald-400", bg: "bg-emerald-50", text: "text-emerald-500" },
  sky: { from: "from-sky-500", to: "to-sky-400", bg: "bg-sky-50", text: "text-sky-500" },
  amber: { from: "from-amber-500", to: "to-amber-400", bg: "bg-amber-50", text: "text-amber-500" },
  rose: { from: "from-rose-500", to: "to-rose-400", bg: "bg-rose-50", text: "text-rose-500" },
  indigo: { from: "from-indigo-500", to: "to-indigo-400", bg: "bg-indigo-50", text: "text-indigo-500" },
}

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [goal, setGoal] = useState<SavingGoal | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  // Fetch goal + contributions
  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      setError(null)
      const [goalData, contribData] = await Promise.all([
        goalService.getGoalById(id),
        goalService.getContributions(id),
      ])
      setGoal({
        id: goalData.id,
        tenMucTieu: goalData.tenMucTieu,
        soTienMucTieu: goalData.soTienMucTieu,
        soTienHienTai: goalData.soTienHienTai,
        ngayMucTieu: goalData.ngayMucTieu,
        ngayTao: goalData.ngayTao,
        viTien: goalData.viTien ? { id: goalData.viTien.id, tenVi: goalData.viTien.tenVi, soDu: goalData.viTien.soDu } : undefined,
        color: "violet",
      })
      setContributions(contribData.map((c: any) => ({
        id: c.id,
        soTien: c.soTien,
        ngayTao: c.ngayTao,
      })))
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể tải chi tiết mục tiêu"
      setError(message)
      console.error("Lỗi fetch goal detail:", err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Handlers
  const handleContribute = async (_goalId: string, amount: number) => {
    if (!goal) return
    try {
      await goalService.contributeToGoal(goal.id, amount)
      // Reload data từ server
      await fetchData()
    } catch (err: any) {
      console.error("Lỗi đóng góp:", err)
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Xảy ra lỗi không xác định."
      alert("Không thể đóng góp: " + errorMsg)
      throw err; // throw so modal can stop closing
    }
  }

  const handleEdit = async (data: GoalFormData) => {
    if (!goal) return
    // NOTE: Backend chưa có PUT endpoint
    setGoal({
      ...goal,
      tenMucTieu: data.tenMucTieu,
      soTienMucTieu: data.soTienMucTieu,
      ngayMucTieu: data.ngayMucTieu,
      color: data.color,
    })
  }

  const handleDelete = async () => {
    if (!goal) return
    if (confirm(`Bạn có chắc muốn xoá mục tiêu "${goal.tenMucTieu}"?`)) {
      try {
        await goalService.deleteGoal(goal.id)
        navigate("/goals")
      } catch (err) {
        console.error("Lỗi xoá mục tiêu:", err)
        alert("Không thể xoá mục tiêu. Vui lòng thử lại.")
      }
    }
  }

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang tải chi tiết mục tiêu...</p>
        </div>
      </div>
    )
  }

  // Error
  if (error || !goal) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">Không tìm thấy mục tiêu</h3>
          <p className="text-xs text-slate-400 mb-4">{error || "Mục tiêu này không tồn tại"}</p>
          <button onClick={() => navigate("/goals")} className="px-4 py-2 bg-violet-500 text-white text-xs rounded-lg hover:bg-violet-600">
            Quay lại danh sách
          </button>
        </div>
      </div>
    )
  }

  const percent = goal.soTienMucTieu > 0
    ? Math.min(Math.round((goal.soTienHienTai / goal.soTienMucTieu) * 100), 100)
    : 0
  const remaining = goal.soTienMucTieu - goal.soTienHienTai
  const daysLeft = getDaysRemaining(goal.ngayMucTieu)
  const isCompleted = percent >= 100
  const colorKey = goal.color || "violet"
  const colors = goalColorMap[colorKey] || goalColorMap.violet
  const chartData = buildChartData(contributions)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate("/goals")}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại danh sách
      </button>

      {/* Hero Card */}
      <Card className={`bg-gradient-to-br ${colors.from} ${colors.to} border-0 shadow-lg rounded-2xl overflow-hidden mb-6`}>
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Target className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">{goal.tenMucTieu}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Wallet className="w-3.5 h-3.5" /> {goal.viTien?.tenVi} {goal.viTien?.soDu !== undefined ? `(${formatCurrency(goal.viTien.soDu)})` : ""}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-white/80">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(goal.ngayMucTieu)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isCompleted && (
                <button
                  onClick={() => setShowContributeModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-800 text-sm font-medium rounded-xl hover:bg-white/90 transition-all shadow-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  Đóng góp
                </button>
              )}
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-white/20 text-white rounded-xl hover:bg-rose-500/80 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-sm text-white/70 mb-1">Đã tiết kiệm</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(goal.soTienHienTai)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70 mb-1">Mục tiêu</p>
                <p className="text-lg font-semibold text-white/90">{formatCurrency(goal.soTienMucTieu)}</p>
              </div>
            </div>

            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-700 ease-out" style={{ width: `${percent}%` }} />
            </div>

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-bold text-white">{percent}%</span>
              <div className="flex items-center gap-4">
                {!isCompleted && (
                  <span className="text-sm text-white/70">Còn thiếu {formatCurrency(remaining > 0 ? remaining : 0)}</span>
                )}
                {!isCompleted && daysLeft > 0 && (
                  <span className="text-sm text-white/70 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {daysLeft} ngày còn lại
                  </span>
                )}
                {isCompleted && (
                  <span className="text-sm font-semibold text-white bg-white/20 px-3 py-1 rounded-full">✓ Hoàn thành</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts + Stats grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-3 bg-white border border-slate-200 shadow-xs rounded-xl">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Biểu Đồ Tích Luỹ</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="h-[280px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}tr`} />
                    <RechartsTooltip
                      contentStyle={{ background: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: 12 }}
                      formatter={(value: number, name: string) => [formatCurrency(value), name === "tichLuy" ? "Tích luỹ" : "Đóng góp"]}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Area type="monotone" dataKey="tichLuy" stroke="#6366f1" strokeWidth={2} fill="url(#areaGrad)" dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }} name="tichLuy" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-sm text-slate-400">
                  Chưa có đóng góp nào
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-xs rounded-xl">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Thống Kê Nhanh</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Số lần đóng góp</p>
              <p className="text-xl font-bold text-slate-800">{contributions.length} lần</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Đóng góp trung bình / lần</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(contributions.length > 0 ? contributions.reduce((s, c) => s + c.soTien, 0) / contributions.length : 0)}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Đóng góp lớn nhất</p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(contributions.length > 0 ? Math.max(...contributions.map((c) => c.soTien)) : 0)}
              </p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-xs text-slate-400 mb-1">Ngày tạo mục tiêu</p>
              <p className="text-sm font-semibold text-slate-700">{formatDate(goal.ngayTao)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contribution History */}
      <Card className="bg-white border border-slate-200 shadow-xs rounded-xl mt-6">
        <CardHeader className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-800">Lịch Sử Đóng Góp</CardTitle>
            <span className="text-xs text-slate-400">{contributions.length} bản ghi</span>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {contributions.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">Chưa có lịch sử đóng góp</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">#</th>
                    <th className="text-left py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Thời gian</th>
                    <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Số tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {[...contributions].reverse().map((c, idx) => (
                    <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 text-slate-400 text-xs">{contributions.length - idx}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateTime(c.ngayTao)}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <span className="font-semibold text-emerald-500">+{formatCurrency(c.soTien)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <ContributionModal
        isOpen={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        onSubmit={handleContribute}
        goal={goal}
      />
      <GoalFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEdit}
        editGoal={goal}
      />
    </div>
  )
}
