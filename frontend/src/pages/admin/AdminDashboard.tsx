import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, Activity, TrendingUp, Loader2 } from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts'
import api from "@/services/api"

interface ThongKeData {
  tongNguoiDung: number
  tongNguoiDungTangTruong: number
  tongGiaoDich: number
  tongGiaoDichTangTruong: number
  tongLuanChuyen: number
  nguoiDungActive: number
  nguoiDungActiveTangTruong: number
  doanhThuTheoThang: any[]
  tangTruongUser: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<ThongKeData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resp = await api.get('/admin/thong-ke/tong-quan')
        setStats(resp.data)
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-violet-500" />
        <p className="text-base font-medium">Đang tải dữ liệu bộ máy phân tích...</p>
      </div>
    )
  }

  if (!stats) return <p className="text-rose-500">Lỗi tải dữ liệu. Vui lòng thử lại sau.</p>

  const renderGrowth = (value: number, suffix: string) => {
    const isPositive = value >= 0;
    return (
      <p className={`text-xs flex items-center font-medium mt-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
        <TrendingUp className={`w-3 h-3 mr-1 ${isPositive ? '' : 'rotate-180'}`} /> 
        {isPositive ? '+' : ''}{value}% {suffix}
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Thống kê Vận hành</h1>
        <p className="text-sm text-slate-500 mt-1">Tổng quan hoạt động toàn hệ thống SpendWise</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tổng Người dùng</CardTitle>
            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.tongNguoiDung.toLocaleString('vi-VN')}</div>
            {renderGrowth(stats.tongNguoiDungTangTruong, 'so với tháng trước')}
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lượt Giao dịch</CardTitle>
            <div className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.tongGiaoDich.toLocaleString('vi-VN')}</div>
            {renderGrowth(stats.tongGiaoDichTangTruong, 'so với tháng trước')}
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Dòng Tiền Luân chuyển</CardTitle>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.tongLuanChuyen)}</div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Tính trên toàn hệ thống
            </p>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Người dùng Active</CardTitle>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{stats.nguoiDungActive.toLocaleString('vi-VN')}</div>
            {renderGrowth(stats.nguoiDungActiveTangTruong, 'so với tuần trước')}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {/* Biểu đồ Dòng tiền */}
        <Card className="shadow-sm border-slate-200 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">Tăng trưởng Khối lượng Giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.doanhThuTheoThang} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Biểu đồ Tương tác User */}
        <Card className="shadow-sm border-slate-200 lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-slate-700">Lượng Người dùng Truy cập</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.tangTruongUser} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar name="Người dùng mới" dataKey="new" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar name="Người dùng Active" dataKey="active" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
