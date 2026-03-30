import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Target,
  Plus,
  PiggyBank,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import GoalCard from "@/components/goals/GoalCard"
import GoalFormModal from "@/components/goals/GoalFormModal"
import ContributionModal from "@/components/goals/ContributionModal"
import type { SavingGoal } from "@/components/goals/GoalCard"
import type { GoalFormData } from "@/components/goals/GoalFormModal"
import * as goalService from "@/services/goalService"
import { getCurrentUserId } from "@/services/api"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

// Map API response → SavingGoal (frontend type)
function mapToSavingGoal(item: goalService.MucTieuTietKiem, index: number): SavingGoal {
  const colors = ["violet", "sky", "emerald", "amber", "rose", "indigo"]
  return {
    id: item.id,
    tenMucTieu: item.tenMucTieu,
    soTienMucTieu: item.soTienMucTieu,
    soTienHienTai: item.soTienHienTai,
    ngayMucTieu: item.ngayMucTieu,
    ngayTao: item.ngayTao,
    viTien: item.viTien ? { id: item.viTien.id, tenVi: item.viTien.tenVi } : undefined,
    color: colors[index % colors.length],
  }
}

export default function Goals() {
  const navigate = useNavigate()
  const [goals, setGoals] = useState<SavingGoal[]>([])
  const [wallets, setWallets] = useState<goalService.ViTien[]>([])
  const [loading, setLoading] = useState(true)
  const [showFormModal, setShowFormModal] = useState(false)
  const [showContributeModal, setShowContributeModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null)
  const [contributingGoal, setContributingGoal] = useState<SavingGoal | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  // Fetch goals từ API (luôn kết nối Backend)
  const fetchGoals = useCallback(async () => {
    try {
      setLoading(true)
      const uid = getCurrentUserId()
      
      const [goalsData, walletsData] = await Promise.all([
        goalService.getGoals(uid || undefined),
        goalService.getWallets(uid || undefined).catch(() => []),
      ])

      if (goalsData && goalsData.length > 0) {
        setGoals(goalsData.map((item, idx) => mapToSavingGoal(item, idx)))
      } else {
        setGoals([])
      }
      setWallets(walletsData || [])
    } catch (err: unknown) {
      console.error("Lỗi fetch goals:", err)
      setGoals([])
    } finally {
      setLoading(false)
    }
  }, []) // Dependency array rỗng vì fetchGoals không phụ thuộc navigate

  useEffect(() => {
    fetchGoals()
  }, [fetchGoals])

  // Tính toán thống kê
  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.soTienHienTai >= g.soTienMucTieu).length
  const activeGoals = totalGoals - completedGoals
  const totalSaved = goals.reduce((sum, g) => sum + g.soTienHienTai, 0)
  const totalTarget = goals.reduce((sum, g) => sum + g.soTienMucTieu, 0)
  const avgPercent = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  // Filter goals
  const filteredGoals = goals.filter((g) => {
    if (filter === "active") return g.soTienHienTai < g.soTienMucTieu
    if (filter === "completed") return g.soTienHienTai >= g.soTienMucTieu
    return true
  })

  // Handlers
  const handleCreateGoal = async (data: GoalFormData) => {
    try {
      await goalService.createGoal(data.viId, {
        tenMucTieu: data.tenMucTieu,
        soTienMucTieu: data.soTienMucTieu,
        ngayMucTieu: data.ngayMucTieu,
      })
      await fetchGoals()
    } catch (err) {
      console.error("Lỗi tạo mục tiêu:", err)
      alert("Không thể tạo mục tiêu. Vui lòng thử lại.")
    }
  }

  const handleEditGoal = async (data: GoalFormData) => {
    if (!editingGoal) return
    setGoals(goals.map((g) =>
      g.id === editingGoal.id
        ? { ...g, tenMucTieu: data.tenMucTieu, soTienMucTieu: data.soTienMucTieu, ngayMucTieu: data.ngayMucTieu, color: data.color }
        : g
    ))
    setEditingGoal(null)
  }

  const handleDeleteGoal = async (goal: SavingGoal) => {
    if (confirm(`Bạn có chắc chắn muốn xoá mục tiêu "${goal.tenMucTieu}"?`)) {
      try {
        await goalService.deleteGoal(goal.id)
        setGoals(goals.filter((g) => g.id !== goal.id))
      } catch (err) {
        console.error("Lỗi xoá mục tiêu:", err)
        alert("Không thể xoá mục tiêu. Vui lòng thử lại.")
      }
    }
  }

  const handleContribute = async (goalId: string, amount: number) => {
    try {
      await goalService.contributeToGoal(goalId, amount)
      setGoals(goals.map((g) =>
        g.id === goalId
          ? { ...g, soTienHienTai: Math.min(g.soTienHienTai + amount, g.soTienMucTieu) }
          : g
      ))
    } catch (err) {
      console.error("Lỗi đóng góp:", err)
      alert("Không thể đóng góp. Vui lòng thử lại.")
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang tải mục tiêu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Mục Tiêu Tiết Kiệm</h1>
          <p className="text-sm text-slate-500">Quản lý và theo dõi các mục tiêu tiết kiệm của bạn</p>
        </div>
        <button
          onClick={() => { setEditingGoal(null); setShowFormModal(true) }}
          className="mt-4 sm:mt-0 flex items-center gap-2 px-5 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-xl hover:bg-violet-600 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Tạo Mục Tiêu Mới
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">TỔNG MỤC TIÊU</p>
                <p className="text-2xl font-bold text-slate-800">{totalGoals}</p>
                <p className="text-xs text-slate-400 mt-1">{activeGoals} đang thực hiện</p>
              </div>
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">ĐÃ TIẾT KIỆM</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">TIẾN ĐỘ TB</p>
                <p className="text-2xl font-bold text-slate-800">{avgPercent}%</p>
                <div className="w-32 h-2.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700"
                    style={{ width: `${avgPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">HOÀN THÀNH</p>
                <p className="text-2xl font-bold text-slate-800">{completedGoals}</p>
                <p className="text-xs text-slate-400 mt-1">{totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}% tổng mục tiêu</p>
              </div>
              <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-sky-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs + Goal List */}
      <Card className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <CardHeader className="px-5 pt-5 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-base font-semibold text-slate-800">Danh Sách Mục Tiêu</CardTitle>
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              {[
                { key: "all" as const, label: "Tất cả", count: totalGoals },
                { key: "active" as const, label: "Đang thực hiện", count: activeGoals },
                { key: "completed" as const, label: "Hoàn thành", count: completedGoals },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    filter === tab.key
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                    filter === tab.key ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          {filteredGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Chưa có mục tiêu nào</h3>
              <p className="text-xs text-slate-400 mb-4">Hãy tạo mục tiêu tiết kiệm đầu tiên của bạn</p>
              <button
                onClick={() => { setEditingGoal(null); setShowFormModal(true) }}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white text-xs font-medium rounded-lg hover:bg-violet-600 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Tạo mục tiêu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onView={(g) => navigate(`/goals/${g.id}`)}
                  onEdit={(g) => { setEditingGoal(g); setShowFormModal(true) }}
                  onDelete={handleDeleteGoal}
                  onContribute={(g) => { setContributingGoal(g); setShowContributeModal(true) }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* === Modals === */}
      <GoalFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingGoal(null) }}
        onSubmit={editingGoal ? handleEditGoal : handleCreateGoal}
        editGoal={editingGoal}
        wallets={wallets}
      />

      <ContributionModal
        isOpen={showContributeModal}
        onClose={() => { setShowContributeModal(false); setContributingGoal(null) }}
        onSubmit={handleContribute}
        goal={contributingGoal}
      />
    </div>
  )
}
