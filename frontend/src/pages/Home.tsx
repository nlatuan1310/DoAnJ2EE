import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { MoreHorizontal, Calendar, BellRing } from "lucide-react"

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts"

// Mini sparkline data for KPI cards
const sparkData1 = [
  { v: 20 }, { v: 35 }, { v: 25 }, { v: 40 }, { v: 30 }, { v: 55 }, { v: 45 },
  { v: 60 }, { v: 50 }, { v: 65 }, { v: 55 }, { v: 70 }, { v: 60 }, { v: 75 },
]
const sparkData2 = [
  { v: 50 }, { v: 45 }, { v: 55 }, { v: 40 }, { v: 50 }, { v: 35 }, { v: 45 },
  { v: 30 }, { v: 40 }, { v: 25 }, { v: 35 }, { v: 30 }, { v: 25 }, { v: 20 },
]
const sparkData3 = [
  { v: 15 }, { v: 20 }, { v: 18 }, { v: 30 }, { v: 25 }, { v: 35 }, { v: 28 },
  { v: 40 }, { v: 38 }, { v: 50 }, { v: 45 }, { v: 55 }, { v: 50 }, { v: 60 },
]

// Bar chart data
const barChartData = [
  { month: "T12", direct: 800, indirect: 1200 },
  { month: "T1", direct: 2500, indirect: 3800 },
  { month: "T2", direct: 3200, indirect: 4200 },
  { month: "T3", direct: 4100, indirect: 5500 },
  { month: "T4", direct: 2800, indirect: 3600 },
  { month: "T5", direct: 2200, indirect: 3000 },
]

// Real time line chart data
const realtimeData = [
  { time: "9:18:10", value: 52 },
  { time: "9:18:22", value: 55 },
  { time: "9:18:34", value: 59 },
  { time: "9:18:46", value: 63 },
  { time: "9:18:58", value: 58 },
  { time: "9:19:10", value: 56 },
  { time: "9:19:22", value: 62 },
]

// Donut chart data
const donutData = [
  { name: "Ăn uống", value: 4500, color: "#6366f1" },
  { name: "Mua sắm", value: 3200, color: "#38bdf8" },
  { name: "Di chuyển", value: 1500, color: "#1e1b4b" },
  { name: "Khác", value: 850, color: "#c4b5fd" },
]

// Table data
const channelData = [
  { name: "Tiền mặt", visitors: "2.4K", revenue: "₫3,877K", sales: 267, conversion: "4.7%" },
  { name: "Chuyển khoản", visitors: "2.2K", revenue: "₫3,426K", sales: 249, conversion: "4.4%" },
  { name: "Thẻ tín dụng", visitors: "2.0K", revenue: "₫2,444K", sales: 224, conversion: "4.2%" },
  { name: "Ví điện tử", visitors: "1.9K", revenue: "₫2,236K", sales: 220, conversion: "4.2%" },
  { name: "Tiết kiệm", visitors: "1.7K", revenue: "₫2,034K", sales: 204, conversion: "3.9%" },
]

const channelColors: Record<string, string> = {
  "Tiền mặt": "bg-blue-500",
  "Chuyển khoản": "bg-indigo-500",
  "Thẻ tín dụng": "bg-emerald-500",
  "Ví điện tử": "bg-amber-500",
  "Tiết kiệm": "bg-rose-500",
}

export default function Home() {
  const [alerts] = useState<any[]>([
    { type: 'Warning', message: 'Ngân sách tháng 3 đã dùng 75%. Hãy cân nhắc chi tiêu!' },
    { type: 'Info', message: 'Hóa đơn Netflix sẽ hết hạn sau 2 ngày nữa.' },
    { type: 'Danger', message: 'Phát hiện giao dịch 5.000.000đ bất thường tại Store XYZ.' }
  ])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      
      {/* Page Header — Mosaic Style */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Dashboard</h1>
        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button className="p-2 border border-slate-200 bg-white rounded-md hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
          {/* Date Picker */}
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Jan 20, 2022 - Feb 09, 2022</span>
          </button>
          {/* Add View Button */}
          <button className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">
            Add View
          </button>
        </div>
      </div>

      {/* Chèn vào đây nè Đạt! */}
      <div className="mb-6 space-y-3">
          {alerts.map((alert, index) => (
              <div key={index} className={`flex items-center gap-3 p-4 rounded-lg border-l-4 ${
                  alert.type === 'Danger' ? 'bg-red-50 border-red-500 text-red-700' : 
                  alert.type === 'Warning' ? 'bg-amber-50 border-amber-500 text-amber-700' : 
                  'bg-blue-50 border-blue-500 text-blue-700'
              }`}>
                  <BellRing className="w-5 h-5" />
                  <span className="font-medium text-sm">{alert.message}</span>
              </div>
          ))}
      </div>

      {/* 3 KPI Cards — Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-4">
        {/* Card 1 — Acme Plus style */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Tổng Số Dư</CardTitle>
            <button className="text-slate-400 hover:text-slate-500">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="px-5 pb-1">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">SỐ DƯ</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-slate-800">45.231K</span>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">+49%</span>
            </div>
            <div className="h-[80px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData1}>
                  <defs>
                    <linearGradient id="sparkGrad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#sparkGrad1)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Acme Advanced style */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Chi Tiêu Tháng</CardTitle>
            <button className="text-slate-400 hover:text-slate-500">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="px-5 pb-1">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">CHI TIÊU</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-slate-800">17.489K</span>
              <span className="text-sm font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full">-14%</span>
            </div>
            <div className="h-[80px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData2}>
                  <defs>
                    <linearGradient id="sparkGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#94a3b8" strokeWidth={2} fill="url(#sparkGrad2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Acme Professional style */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-0 pt-5 px-5">
            <CardTitle className="text-base font-semibold text-slate-800">Tiết Kiệm</CardTitle>
            <button className="text-slate-400 hover:text-slate-500">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </CardHeader>
          <CardContent className="px-5 pb-1">
            <div className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">MỤC TIÊU</div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-slate-800">9.962K</span>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-full">+49%</span>
            </div>
            <div className="h-[80px] -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparkData3}>
                  <defs>
                    <linearGradient id="sparkGrad3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#6366f1" strokeWidth={2} fill="url(#sparkGrad3)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row — Bar Chart + Real Time */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* Direct VS Indirect — Bar Chart */}
        <Card className="lg:col-span-3 bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Thu nhập VS Chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span className="text-2xl font-bold text-slate-800">₫8.25K</span>
                <span className="text-sm text-slate-500">Thu nhập</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-300"></span>
                <span className="text-2xl font-bold text-slate-800">₫27.7K</span>
                <span className="text-sm text-slate-500">Chi tiêu</span>
              </div>
            </div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} barGap={2} barSize={16}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `₫${v / 1000}K`} />
                  <RechartsTooltip
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="direct" fill="#6366f1" radius={[4, 4, 0, 0]} name="Thu nhập" />
                  <Bar dataKey="indirect" fill="#a5b4fc" radius={[4, 4, 0, 0]} name="Chi tiêu" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Real Time Value — Line Chart */}
        <Card className="lg:col-span-2 bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold text-slate-800">Giá trị Thời gian thực</CardTitle>
              <span className="text-slate-400 cursor-help">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-slate-800">₫57.75</span>
              <span className="text-sm font-semibold text-rose-500">-0.10%</span>
            </div>
            <div className="h-[230px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={realtimeData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[20, 80]} tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 11 }} tickFormatter={(v) => `₫${v}`} />
                  <RechartsTooltip
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row — Donut Chart + Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Categories — Donut Chart */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Phân loại Chi tiêu</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 flex flex-col items-center">
            <div className="w-full h-[300px] flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: "#1e293b", border: "none", borderRadius: "6px", color: "#fff", fontSize: 12 }}
                    formatter={(value: number) => `₫${value.toLocaleString('vi-VN')}K`}
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
          </CardContent>
        </Card>

        {/* Top Channels — Table */}
        <Card className="bg-white border border-slate-200 shadow-xs rounded-sm">
          <CardHeader className="px-5 pt-5 pb-4">
            <CardTitle className="text-base font-semibold text-slate-800">Kênh Giao dịch</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Nguồn</th>
                    <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Lượt GD</th>
                    <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Doanh thu</th>
                    <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Số lượng</th>
                    <th className="text-right py-3 px-2 text-[11px] uppercase font-semibold text-slate-400 tracking-wider">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody>
                  {channelData.map((channel) => (
                    <tr key={channel.name} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-8 h-8 rounded-full ${channelColors[channel.name]} flex items-center justify-center text-white text-xs font-bold`}>
                            {channel.name.charAt(0)}
                          </span>
                          <span className="font-medium text-slate-700">{channel.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-2 text-slate-600">{channel.visitors}</td>
                      <td className="text-right py-3 px-2 font-medium text-emerald-500">{channel.revenue}</td>
                      <td className="text-right py-3 px-2 text-slate-600">{channel.sales}</td>
                      <td className="text-right py-3 px-2 text-emerald-500">{channel.conversion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
