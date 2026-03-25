import { useState, useEffect } from "react"
import { X, Target } from "lucide-react"
import type { SavingGoal } from "./GoalCard"
import type { ViTien } from "@/services/goalService"

export interface GoalFormData {
  tenMucTieu: string
  soTienMucTieu: number
  ngayMucTieu: string
  viId: string
  color?: string
}

interface GoalFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: GoalFormData) => Promise<void>
  editGoal?: SavingGoal | null
  wallets?: ViTien[]
}

export default function GoalFormModal({ isOpen, onClose, onSubmit, editGoal, wallets = [] }: GoalFormModalProps) {
  const [tenMucTieu, setTenMucTieu] = useState("")
  const [soTienMucTieu, setSoTienMucTieu] = useState("")
  const [ngayMucTieu, setNgayMucTieu] = useState("")
  const [viId, setViId] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (editGoal) {
      setTenMucTieu(editGoal.tenMucTieu)
      setSoTienMucTieu(String(editGoal.soTienMucTieu))
      setNgayMucTieu(editGoal.ngayMucTieu || "")
      setViId(editGoal.viTien?.id || "")
    } else {
      setTenMucTieu("")
      setSoTienMucTieu("")
      setNgayMucTieu("")
      if (wallets && wallets.length > 0) {
        setViId(wallets[0].id)
      } else {
        setViId("")
      }
    }
  }, [editGoal, isOpen, wallets])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await onSubmit({
        tenMucTieu,
        soTienMucTieu: Number(soTienMucTieu),
        ngayMucTieu,
        viId: viId || localStorage.getItem("viId") || "",
      })
      onClose()
    } catch {
      // error handled by parent
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-600" />
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {editGoal ? "Chỉnh Sửa Mục Tiêu" : "Tạo Mục Tiêu Mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Tên mục tiêu
              </label>
              <input
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                placeholder="VD: Mua MacBook, Du lịch Nhật Bản..."
                value={tenMucTieu}
                onChange={(e) => setTenMucTieu(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Số tiền mục tiêu (VNĐ)
              </label>
              <input
                required
                type="number"
                min="1000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                placeholder="25,000,000"
                value={soTienMucTieu}
                onChange={(e) => setSoTienMucTieu(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ngày dự kiến đạt được
              </label>
              <input
                required
                type="date"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                value={ngayMucTieu}
                onChange={(e) => setNgayMucTieu(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ví nguồn trích tiền
              </label>
              <select
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                value={viId}
                onChange={(e) => setViId(e.target.value)}
              >
                <option value="" disabled>-- Chọn ví tiết kiệm --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.tenVi} (Số dư: {new Intl.NumberFormat("vi-VN").format(w.soDu || 0)}đ)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-violet-500 text-white text-sm font-semibold rounded-xl hover:bg-violet-600 disabled:opacity-60 transition-colors shadow-sm"
            >
              {submitting ? "Đang lưu..." : editGoal ? "Cập Nhật" : "Tạo Mục Tiêu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
