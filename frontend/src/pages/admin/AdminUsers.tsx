import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Loader2, Trash2, ShieldAlert } from "lucide-react"
import api from "@/services/api"

interface User {
  id: string
  email: string
  hoVaTen: string
  dienThoai: string
  vaiTro: string
  ngayTao: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const resp = await api.get("/nguoi-dung")
      if (Array.isArray(resp.data)) {
        setUsers(resp.data)
      } else {
        setUsers([])
      }
    } catch (err: any) {
      console.error(err)
      setError("Không thể tải danh sách Người dùng. Vui lòng kiểm tra quyền Admin.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(
    (u) =>
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.hoVaTen && u.hoVaTen.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản: ${name}?`)) return;
    try {
      await api.delete(`/nguoi-dung/${id}`)
      setUsers(users.filter(u => u.id !== id))
      alert("Đã xóa tài khoản thành công!")
    } catch (err: any) {
      alert("Lỗi khi xóa tài khoản: " + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý Người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách thành viên đăng ký sử dụng hệ thống</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-700">Danh sách tài khoản</CardTitle>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm email, tên..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-rose-500">
              <ShieldAlert className="w-10 h-10 mb-3" />
              <p className="font-medium text-center">{error}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Người dùng</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Vai trò</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">SĐT</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Ngày tham gia</th>
                    <th className="text-right px-6 py-3 font-semibold text-slate-500">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs uppercase">
                            {user.hoVaTen ? user.hoVaTen.charAt(0) : "U"}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{user.hoVaTen || "Người dùng ẩn danh"}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider
                          ${user.vaiTro === "ADMIN" || user.vaiTro === "admin" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}
                        `}>
                          {user.vaiTro}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {user.dienThoai || "—"}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm">
                        {user.ngayTao ? new Date(user.ngayTao).toLocaleDateString("vi-VN") : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(user.id, user.hoVaTen)}
                          className="p-1.5 rounded-md border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors inline-block mr-2"
                          title="Xoá tài khoản"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Không tìm thấy người dùng nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
