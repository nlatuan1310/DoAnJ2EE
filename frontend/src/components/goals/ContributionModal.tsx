import { useState } from "react"
import { X, Banknote, Target } from "lucide-react"
import type { SavingGoal } from "./GoalCard"

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

interface ContributionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (goalId: string, amount: number) => Promise<void>
  goal: SavingGoal | null
}

export default function ContributionModal({ isOpen, onClose, onSubmit, goal }: ContributionModalProps) {
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen || !goal) return null

  const remaining = Math.max(0, goal.soTienMucTieu - goal.soTienHienTai)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit(goal.id, Number(amount))
      setAmount("")
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  // Quick amounts
  const quickAmounts = [100000, 500000, 1000000, 2000000]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Nạp Thêm Tiền</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Goal info */}
          <div className="mb-5 bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-start gap-3">
            <Target className="w-5 h-5 text-violet-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">{goal.tenMucTieu}</p>
              <div className="flex flex-col gap-0.5 mt-1">
                <p className="text-xs text-slate-500">
                  Còn thiếu: <span className="text-violet-600 font-bold">{formatCurrency(remaining)}</span>
                </p>
                {goal.viTien?.soDu !== undefined && (
                  <p className="text-xs text-slate-500">
                    Số dư [{goal.viTien.tenVi}]: <span className="text-emerald-600 font-bold">{formatCurrency(goal.viTien.soDu)}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickAmounts.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(String(qa))}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  Number(amount) === qa
                    ? "bg-violet-50 border-violet-300 text-violet-700"
                    : "bg-white border-slate-200 text-slate-600 hover:border-violet-200"
                }`}
              >
                {formatCurrency(qa)}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Hoặc nhập số tiền tùy chọn
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Banknote className="h-5 w-5 text-violet-400" />
              </div>
              <input
                required
                type="number"
                min="1000"
                className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all font-bold text-xl text-slate-800"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={submitting || !amount || Number(amount) <= 0}
              className="w-full px-4 py-3 bg-violet-500 text-white text-sm font-semibold rounded-xl hover:bg-violet-600 disabled:opacity-60 transition-all shadow-sm"
            >
              {submitting ? "Đang xử lý..." : "Nạp Tiền Ngay"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
