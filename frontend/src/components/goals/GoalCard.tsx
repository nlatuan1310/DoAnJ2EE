import {
  Target,
  CalendarDays,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { useState } from "react"

export interface SavingGoal {
  id: string
  tenMucTieu: string
  soTienMucTieu: number
  soTienHienTai: number
  ngayMucTieu: string
  ngayTao: string
  viTien?: { id: string; tenVi: string; soDu?: number }
  color?: string
}

interface GoalCardProps {
  goal: SavingGoal
  onView: (goal: SavingGoal) => void
  onEdit: (goal: SavingGoal) => void
  onDelete: (goal: SavingGoal) => void
  onContribute: (goal: SavingGoal) => void
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "Chưa xác định"
  try {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

const colorMap: Record<string, { bg: string; text: string; bar: string; icon: string }> = {
  violet: { bg: "bg-violet-50", text: "text-violet-600", bar: "from-violet-500 to-violet-400", icon: "text-violet-500" },
  sky: { bg: "bg-sky-50", text: "text-sky-600", bar: "from-sky-500 to-sky-400", icon: "text-sky-500" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "from-emerald-500 to-emerald-400", icon: "text-emerald-500" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "from-amber-500 to-amber-400", icon: "text-amber-500" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", bar: "from-rose-500 to-rose-400", icon: "text-rose-500" },
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "from-indigo-500 to-indigo-400", icon: "text-indigo-500" },
}

export default function GoalCard({ goal, onView, onEdit, onDelete, onContribute }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const progress = goal.soTienMucTieu > 0
    ? Math.min(100, Math.round((goal.soTienHienTai / goal.soTienMucTieu) * 1000) / 10)
    : 0
  const isCompleted = progress >= 100
  const colors = colorMap[goal.color || "violet"] || colorMap.violet

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow relative group">
      {/* Top color bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${isCompleted ? "from-emerald-500 to-emerald-400" : colors.bar}`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
            <Target className={`w-5 h-5 ${colors.icon}`} />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 z-20 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 overflow-hidden">
                  <button
                    onClick={() => { setShowMenu(false); onView(goal) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-slate-400" /> Xem chi tiết
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onEdit(goal) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-slate-400" /> Chỉnh sửa
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onDelete(goal) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Xoá
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Goal info */}
        <h3 className="text-sm font-semibold text-slate-800 mb-1 truncate">{goal.tenMucTieu}</h3>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <CalendarDays className="w-3 h-3" />
          <span>{formatDate(goal.ngayMucTieu)}</span>
          {isCompleted && (
            <span className="ml-auto px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
              Hoàn thành
            </span>
          )}
        </div>

        {goal.viTien && (
          <div className="flex justify-between items-center text-[11px] text-slate-500 mb-4 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
            <span className="font-medium text-slate-600 truncate max-w-[50%]">Ví: {goal.viTien.tenVi}</span>
            <span>Số dư: <span className="font-semibold text-slate-700">{formatCurrency(goal.viTien.soDu || 0)}</span></span>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-lg font-bold text-slate-800">{formatCurrency(goal.soTienHienTai)}</span>
          <span className="text-xs text-slate-400">/ {formatCurrency(goal.soTienMucTieu)}</span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${
              isCompleted ? "from-emerald-500 to-emerald-400" : colors.bar
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-right text-[11px] font-semibold text-slate-400">{progress}%</p>

        {/* Contribute button */}
        {!isCompleted && (
          <button
            onClick={() => onContribute(goal)}
            className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border-2 border-slate-200 text-slate-600 hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50 transition-all`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Nạp thêm tiền
          </button>
        )}
      </div>
    </div>
  )
}
