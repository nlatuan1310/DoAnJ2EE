import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  PieChart as LucidePieChart, 
  TrendingUp, 
  Calendar,
  Tags,
  LayoutGrid,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  AlertCircle
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from "recharts";
import { thongKeApi } from "@/services/api";

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function Analytics() {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [activePreset, setActivePreset] = useState("month");
  
  const setPreset = (preset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    
    switch (preset) {
      case "today":
        break;
      case "yesterday":
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case "3days":
        start.setDate(today.getDate() - 2);
        break;
      case "week":
        start.setDate(today.getDate() - 6);
        break;
      case "month":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      default:
        return;
    }
    
    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
    setActivePreset(preset);
  };
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [catStats, setCatStats] = useState<any[]>([]);
  const [tagStats, setTagStats] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = `${startDate}T00:00:00`;
      const end = `${endDate}T23:59:59`;
      
      const [catRes, tagRes, trendRes] = await Promise.all([
        thongKeApi.getCategoryStats(start, end),
        thongKeApi.getTagStats(start, end),
        thongKeApi.getTrend(start, end)
      ]);
      
      setCatStats(catRes.data);
      setTagStats(tagRes.data);
      
      // Transform trend data: [date, amount] -> {date, amount}
      const transformedTrend = trendRes.data.map((item: any) => ({
        date: new Date(item[0]).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        amount: item[1]
      }));
      setTrendData(transformedTrend);
      
    } catch (err: any) {
      console.error("Lỗi khi tải thống kê:", err);
      setError("Không thể tải dữ liệu thống kê. Vui lòng kiểm tra Backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [startDate, endDate]);

  const totalSpending = catStats.reduce((sum, item) => sum + item.tongTien, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-violet-600" /> Phân tích chi tiêu
          </h1>
          <p className="text-slate-500 mt-2">Thống kê chi tiết theo Danh mục và Nhãn dán (Tag).</p>
        </div>
        
        {/* Date Filters & Presets */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Quick Presets */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
            {[
              { id: "today", label: "Hôm nay" },
              { id: "yesterday", label: "Hôm qua" },
              { id: "3days", label: "3 ngày qua" },
              { id: "week", label: "Tuần này" },
              { id: "month", label: "Tháng này" },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activePreset === p.id
                    ? "bg-white text-violet-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 px-3 border-r border-slate-100">
              <Calendar className="w-4 h-4 text-slate-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="text-sm font-medium text-slate-700 outline-none border-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 text-slate-400">
              <span>đến</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setActivePreset("custom");
                }}
                className="text-sm font-medium text-slate-700 outline-none border-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {loading && catStats.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-slate-500 font-medium font-inter">Đang tổng hợp dữ liệu chi tiêu...</p>
        </div>
      ) : error ? (
        <div className="p-10 text-center bg-rose-50 rounded-3xl border border-rose-100">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-rose-800">Đã có lỗi xảy ra</h3>
          <p className="text-rose-600 mt-1">{error}</p>
          <button 
            onClick={fetchStats}
            className="mt-6 px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
          >
            Thử lại ngay
          </button>
        </div>
      ) : (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 border-none text-white overflow-hidden relative group">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-32 h-32 text-white" />
              </div>
              <CardContent className="p-6">
                <p className="text-violet-100 text-xs font-bold uppercase tracking-widest mb-1">Tổng chi tiêu</p>
                <h3 className="text-3xl font-black">{fmtVND(totalSpending)}</h3>
                <div className="mt-4 flex items-center gap-2 text-sm text-violet-100">
                  <div className="flex items-center bg-white/20 px-1.5 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> 12%
                  </div>
                  <span>so với tháng trước</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Category</span>
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Top Category</p>
                <h3 className="text-xl font-bold text-slate-800">
                  {catStats[0]?.tenDanhMuc || "—"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Nhiều nhất trong kỳ này</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Tags className="w-5 h-5 text-emerald-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Tags</span>
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Top Tag</p>
                <h3 className="text-xl font-bold text-slate-800">
                   {tagStats[0]?.tenTag || "Chưa có"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Nhãn dán được dùng nhiều</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200/60 shadow-sm">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Average</span>
                </div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Trung bình/Ngày</p>
                <h3 className="text-xl font-bold text-slate-800">
                  {fmtVND(totalSpending / (trendData.length || 1))}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Dựa trên {trendData.length} ngày có chi tiêu</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Category Breakdown (Pie Chart) */}
            <Card className="lg:col-span-5 bg-white border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <LucidePieChart className="w-5 h-5 text-violet-500" />
                  Cơ cấu Danh mục
                </CardTitle>
                <CardDescription>Tỉ lệ % chi tiêu giữa các danh mục thu nhập/chi phí.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={catStats}
                        dataKey="tongTien"
                        nameKey="tenDanhMuc"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {catStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.mauSac || '#8884d8'} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(value: number) => fmtVND(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Custom list of categories with % */}
                <div className="mt-6 space-y-3">
                  {catStats.slice(0, 5).map((item) => (
                    <div key={item.danhMucId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.mauSac }} />
                        <span className="text-sm font-medium text-slate-600">{item.tenDanhMuc}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-slate-400">{item.phanTram}%</span>
                         <span className="text-sm font-bold text-slate-700">{fmtVND(item.tongTien)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Trend (Line Chart) */}
            <Card className="lg:col-span-7 bg-white border-slate-200/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-500" />
                  Xu hướng chi tiêu
                </CardTitle>
                <CardDescription>Biểu đồ biến động chi tiêu hàng ngày trong khoảng thời gian đã chọn.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        tickFormatter={(v) => `${(v/1000).toLocaleString()}k`}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => fmtVND(value)}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend/Summary for trend */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ngày chi nhiều nhất</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                        {trendData.length > 0 ? trendData.sort((a,b) => b.amount - a.amount)[0].date : "—"}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-rose-500" />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Ngày chi ít nhất</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700">
                         {trendData.length > 0 ? trendData.sort((a,b) => a.amount - b.amount)[0].date : "—"}
                      </span>
                      <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tag Analysis (Bar Chart) */}
            <Card className="lg:col-span-12 bg-white border-slate-200/60 shadow-sm mt-6">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Tags className="w-5 h-5 text-violet-500" />
                    Phân tích theo Tag (Nhãn)
                  </CardTitle>
                  <CardDescription>Xếp hạng mức độ chi tiêu theo các nhãn dán thủ công.</CardDescription>
                </div>
                <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-xs font-semibold border border-amber-100">
                  Thẻ giúp bạn phân loại chi tiết hơn Danh mục
                </div>
              </CardHeader>
              <CardContent>
                {tagStats.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                     <Tags className="w-12 h-12 mb-3 opacity-20" />
                     <p className="text-sm font-medium">Chưa có dữ liệu Tag trong khoảng thời gian này.</p>
                     <p className="text-xs mt-1 text-slate-300">Hãy gắn Tag cho giao dịch để xem thống kê tại đây.</p>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tagStats} layout="vertical" margin={{ left: 40, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" hide />
                        <YAxis 
                          dataKey="tenTag" 
                          type="category" 
                          axisLine={false} 
                          tickLine={false}
                          tick={{ fill: '#475569', fontWeight: 600, fontSize: 12 }}
                        />
                        <RechartsTooltip 
                          cursor={{ fill: '#f8fafc' }}
                          formatter={(value: number) => fmtVND(value)}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar 
                          dataKey="tongTien" 
                          fill="#8b5cf6" 
                          radius={[0, 10, 10, 0]} 
                          barSize={24}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
