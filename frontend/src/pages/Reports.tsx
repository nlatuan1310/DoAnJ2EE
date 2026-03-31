
import { useState, useEffect, useMemo } from "react"

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card"
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Mail,
  Sparkles,
  Eye
} from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, startOfYear, parseISO } from "date-fns"
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  BarChart,
  Bar
} from 'recharts';
import api, { getCurrentUserId } from "@/services/api";
import walletService, { Wallet } from "@/services/walletService";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"






interface GiaoDich {
  id: string;
  soTien: number;
  loai: string;
  moTa: string;
  ngayGiaoDich: string;
  danhMuc?: { tenDanhMuc: string };
  viTien?: { id: string, tenVi: string };
}

export default function Reports() {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly')
  const [reportName, setReportName] = useState<string>("")
  const [selectedWallet, setSelectedWallet] = useState<string>("all")
  const [wallets, setWallets] = useState<Wallet[]>([])

  const [loading, setLoading] = useState<{ excel: boolean; pdf: boolean }>({
    excel: false,
    pdf: false
  })
  const [loadingComparison, setLoadingComparison] = useState(false)
  const [compStart1, setCompStart1] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0]
  )
  const [compEnd1, setCompEnd1] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0]
  )
  const [compStart2, setCompStart2] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [compEnd2, setCompEnd2] = useState<string>(
    new Date().toISOString().split('T')[0]
  )

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null
  })

  const [transactions, setTransactions] = useState<GiaoDich[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isExportingSingle, setIsExportingSingle] = useState<string | null>(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<'excel' | 'pdf' | 'single' | null>(null)
  const [pendingSingleId, setPendingSingleId] = useState<string | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<GiaoDich | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [isFetching, setIsFetching] = useState(false)


  // Advanced Filters for Single Transactions
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [filterYear, setFilterYear] = useState<string>("all")
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [receiverEmail, setReceiverEmail] = useState("")
  const [customMessage, setCustomMessage] = useState("")

  const handleSendEmail = async () => {
    if (!pendingFormat) return;
    setIsSendingEmail(true)
    setMessage({ text: '', type: null })
    try {
      let url = "";
      if (pendingFormat === 'single') {
        if (!pendingSingleId) throw new Error("ID giao dịch không hợp lệ");
        const queryParams = new URLSearchParams({
          emailNhan: receiverEmail,
          noiDung: customMessage
        }).toString();
        url = `/reports/export/transaction/${pendingSingleId}/email?${queryParams}`;
      } else {
        const startDateTime = `${startDate}T00:00:00`
        const endDateTime = `${endDate}T23:59:59`
        const fmt = pendingFormat === 'excel' ? 'xlsx' : 'pdf'
        const queryParams = new URLSearchParams({
          start: startDateTime,
          end: endDateTime,
          loai: reportType,
          format: fmt,
          tenBaoCao: reportName,
          emailNhan: receiverEmail,
          noiDung: customMessage
        });
        if (selectedWallet !== 'all') {
          queryParams.append('viId', selectedWallet);
        }
        url = `/reports/export/email?${queryParams.toString()}`;
      }

      await api.get(url);
      
      setMessage({ text: receiverEmail ? `Báo cáo đã được gửi tới ${receiverEmail}!` : "Báo cáo đã được gửi tới email của bạn!", type: 'success' })
      setShowNameModal(false)
      setReportName("")
      setReceiverEmail("")
      setCustomMessage("")
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error.message || 'Lỗi gửi email báo cáo.', type: 'error' })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const fmtVND = (n: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  
  const fmtDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "Ngày lỗi" : d.toLocaleDateString("vi-VN");
  };

  const handleSetPresetRange = (range: 'today' | 'week' | 'month' | 'year' | 'last30') => {
    const today = new Date();
    let start = today;
    let end = today;

    switch (range) {
      case 'today':
        start = today;
        break;
      case 'week':
        start = subDays(today, 7);
        break;
      case 'month':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'year':
        start = startOfYear(today);
        break;
      case 'last30':
        start = subDays(today, 30);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };





  const fetchTransactions = async () => {
    const uid = getCurrentUserId();
    if (!uid) return;
    setIsFetching(true);
    try {
      const res = await api.get(`/giao-dich/nguoi-dung/${uid}`);
      let list = Array.isArray(res.data) ? res.data : [];
      // Lọc theo ngày
      const from = new Date(startDate + "T00:00:00");
      const to = new Date(endDate + "T23:59:59");
      list = list.filter(gd => {
        const d = new Date(gd.ngayGiaoDich);
        return d >= from && d <= to;
      });
      // Lọc theo ví
      if (selectedWallet !== "all") {
        list = list.filter(gd => gd.viTien?.id === selectedWallet);
      }
      setTransactions(list);
    } catch (err) {
      console.error("Lỗi khi tải giao dịch:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const filteredList = useMemo(() => {
    return transactions.filter(gd => {
      const matchesSearch = gd.moTa.toLowerCase().includes(searchKeyword.toLowerCase());
      const d = new Date(gd.ngayGiaoDich);
      const matchesMonth = filterMonth === 'all' || (d.getMonth() + 1).toString() === filterMonth;
      const matchesYear = filterYear === 'all' || d.getFullYear().toString() === filterYear;
      const val = gd.soTien;
      const matchesMin = minAmount === "" || val >= parseFloat(minAmount);
      const matchesMax = maxAmount === "" || val <= parseFloat(maxAmount);
      return matchesSearch && matchesMonth && matchesYear && matchesMin && matchesMax;
    });
  }, [transactions, searchKeyword, filterMonth, filterYear, minAmount, maxAmount]);

  // Data processing for charts
  const chartData = useMemo(() => {
    // We remove the early return to allow dailyTrendData to be initialized even if list is empty
    // but categoryData will be empty.

    // Group by category
    const categoryStats: Record<string, number> = {};
    filteredList.filter(t => t.loai === 'expense').forEach(t => {
      const cat = t.danhMuc?.tenDanhMuc || "Khác";
      categoryStats[cat] = (categoryStats[cat] || 0) + t.soTien;
    });

    const categoryData = Object.entries(categoryStats).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Group by day for trend
    const dailyMap: Record<string, { date: string, thu: number, chi: number }> = {};
    const dStart = parseISO(startDate);
    const dEnd = parseISO(endDate);
    
    // Initialize days in range
    let curr = dStart;
    while (curr <= dEnd) {
      const dayStr = format(curr, 'yyyy-MM-dd');
      dailyMap[dayStr] = { date: format(curr, 'dd/MM'), thu: 0, chi: 0 };
      curr = subDays(curr, -1);
    }

    filteredList.forEach(t => {
      const dayStr = t.ngayGiaoDich.split('T')[0];
      if (dailyMap[dayStr]) {
        if (t.loai === 'income') dailyMap[dayStr].thu += t.soTien;
        else dailyMap[dayStr].chi += t.soTien;
      }
    });

    return { 
      categoryData, 
      dailyTrendData: Object.values(dailyMap)
    };
  }, [filteredList, startDate, endDate]);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  const analysis503020 = useMemo(() => {
    const expenses = filteredList.filter(t => t.loai === 'expense');
    const totalExp = expenses.reduce((s, t) => s + t.soTien, 0);

    if (totalExp === 0) return null;

    const groups = {
      needs: { label: "Thiết yếu (50%)", actual: 0, target: 0.5, color: "#6366f1", keywords: ["ăn uống", "nhà ở", "điện", "nước", "xăng", "học tập", "y tế", "siêu thị", "nhà", "gas", "internet", "di động"] },
      wants: { label: "Sở thích (30%)", actual: 0, target: 0.3, color: "#ec4899", keywords: ["giải trí", "cafe", "mua sắm", "du lịch", "làm đẹp", "quà tặng", "game", "phim ảnh", "du lịch", "gym", "spa", "thể thao"] },
      savings: { label: "Tích lũy (20%)", actual: 0, target: 0.2, color: "#10b981", keywords: ["tiết kiệm", "đầu tư", "bảo hiểm", "trả nợ", "chứng khoán", "vàng", "crypto", "nợ", "lãi", "tài chính"] }
    };

    expenses.forEach(t => {
      const cat = (t.danhMuc?.tenDanhMuc || "").toLowerCase();
      if (groups.needs.keywords.some(k => cat.includes(k))) groups.needs.actual += t.soTien;
      else if (groups.savings.keywords.some(k => cat.includes(k))) groups.savings.actual += t.soTien;
      else groups.wants.actual += t.soTien; // Default to wants or "other"
    });

    const result = Object.values(groups).map(g => ({
      name: g.label,
      value: g.actual,
      percent: (g.actual / totalExp) * 100,
      targetPercent: g.target * 100,
      color: g.color,
      status: (g.actual / totalExp) > g.target ? "Vượt ngưỡng" : "Ổn định",
      advice: (g.actual / totalExp) > g.target 
        ? `Bạn đang tiêu vượt ${( ( (g.actual / totalExp) - g.target ) * 100).toFixed(1)}% so với mục tiêu.`
        : `Tuyệt vời! Bạn đang kiểm soát tốt nhóm này.`
    }));

    return { totalExp, result };
  }, [filteredList]);

  const summary = useMemo(() => {
    const inc = filteredList.filter(t => t.loai === 'income').reduce((s: number, t: GiaoDich) => s + t.soTien, 0);
    const exp = filteredList.filter(t => t.loai === 'expense').reduce((s: number, t: GiaoDich) => s + t.soTien, 0);
    return { count: filteredList.length, income: inc, expense: exp };
  }, [filteredList]);

  const isPreviewOn = localStorage.getItem('preview_report') !== 'false';

  const fetchWallets = async () => {
    const uid = getCurrentUserId();
    if (!uid) return;
    try {
      const res = await walletService.getWallets(uid);
      setWallets(res.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ví:", err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchWallets();
  }, [startDate, endDate, selectedWallet]);

  const handleExportSingle = (gdId: string, description: string) => {
    setPendingFormat('single')
    setPendingSingleId(gdId)
    setReportName(`GiaoDich_${description.replace(/\s+/g, "_")}`)
    setShowNameModal(true)
  }

  const handleExport = async (formatType: 'excel' | 'pdf' | 'single', isConfirmed: boolean = false) => {
    if (!isConfirmed) {
      setPendingFormat(formatType)
      setShowNameModal(true)
      return
    }

    setShowNameModal(false)
    if (formatType === 'single') {
      await performSingleExport();
      return;
    }

    setLoading(prev => ({ ...prev, [formatType as 'excel' | 'pdf']: true }))
    setMessage({ text: '', type: null })

    try {
      const startDateTime = `${startDate}T00:00:00`
      const endDateTime = `${endDate}T23:59:59`
      const viParam = selectedWallet !== 'all' ? `&viId=${selectedWallet}` : ''
      
      const response = await api.get(
        `/reports/export/${formatType}?start=${startDateTime}&end=${endDateTime}&loai=${reportType}&tenBaoCao=${encodeURIComponent(reportName)}${viParam}`,
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      const defaultName = `BaoCao_${reportType === 'monthly' ? 'Thang' : 'Nam'}_${formatType === 'excel' ? 'Excel' : 'PDF'}_${format(new Date(), 'yyyyMMdd')}`
      const fileExt = formatType === 'excel' ? 'xlsx' : 'pdf'
      const finalFileName = reportName.trim() ? `${reportName.replace(/\.[^/.]+$/, "")}.${fileExt}` : `${defaultName}.${fileExt}`
      
      a.download = finalFileName

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)


      setMessage({ text: `Xuất báo cáo thành công!`, type: 'success' })
      setReportName("") 
      setPendingFormat(null)
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error.message || 'Có lỗi xảy ra khi tải báo cáo.', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, [formatType as 'excel' | 'pdf']: false }))
    }
  }

  const performSingleExport = async () => {
    if (!pendingSingleId) return;
    const gdId = pendingSingleId;
    setIsExportingSingle(gdId);
    try {
      const response = await api.get(
        `/reports/export/transaction/${gdId}?tenBaoCao=${encodeURIComponent(reportName)}`,
        { responseType: 'blob' }
      )
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const finalFileName = reportName.trim() ? `${reportName.replace(/\.[^/.]+$/, "")}.pdf` : `GiaoDich_Detail.pdf`
      a.download = finalFileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      setMessage({ text: "Xuất báo cáo giao dịch thành công!", type: 'success' })
      setReportName("")
      setPendingSingleId(null)
      setPendingFormat(null)
    } catch (err) {
      console.error(err);
      setMessage({ text: "Lỗi khi xuất báo cáo giao dịch.", type: 'error' })
    } finally {
      setIsExportingSingle(null);
    }
  }

  const handleExportComparison = async () => {
    setLoadingComparison(true)
    setMessage({ text: '', type: null })

    try {
      const startDateTime1 = `${compStart1}T00:00:00`
      const endDateTime1 = `${compEnd1}T23:59:59`
      const startDateTime2 = `${compStart2}T00:00:00`
      const endDateTime2 = `${compEnd2}T23:59:59`
      const viParam = selectedWallet !== 'all' ? `&viId=${selectedWallet}` : ''
      
      const response = await api.get(
        `/reports/export/comparison/pdf?start1=${startDateTime1}&end1=${endDateTime1}&start2=${startDateTime2}&end2=${endDateTime2}${viParam}`,
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const finalFileName = `BaoCao_SoSanh_${format(new Date(), 'yyyyMMdd')}.pdf`
      a.download = finalFileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ text: `Xuất báo cáo so sánh thành công!`, type: 'success' })

    } catch (error: any) {
      console.error(error)
      setMessage({ text: error.message || 'Có lỗi xảy ra khi tải báo cáo.', type: 'error' })
    } finally {
      setLoadingComparison(false)
    }
  }





  // Auto-hide message
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: null });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">

      {/* Transaction Detail Modal */}
      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[32px] p-0 overflow-hidden border-0 bg-white shadow-2xl">
          {selectedTransaction && (
            <div className="flex flex-col">
              {/* Header with Color Accent */}
              <div className={`px-8 py-10 text-white ${selectedTransaction.loai === 'income' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-rose-500 to-pink-600'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1">Mã tham chiếu</p>
                    <p className="text-xs font-mono opacity-90">#{selectedTransaction.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-sm font-bold opacity-80 uppercase tracking-tight mb-1">Số tiền giao dịch</h2>
                  <p className="text-4xl font-black tracking-tighter">
                    {selectedTransaction.loai === 'income' ? '+' : '-'}{fmtVND(selectedTransaction.soTien)}
                  </p>
                </div>
              </div>

              {/* Body */}
              <div className="px-8 py-8 space-y-6 bg-white relative -mt-6 rounded-t-[32px]">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại giao dịch</p>
                    <div className="flex items-center gap-2">
                       <div className={`w-2 h-2 rounded-full ${selectedTransaction.loai === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                       <p className="font-bold text-slate-800">{selectedTransaction.loai === 'income' ? 'Thu nhập' : 'Chi tiêu'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày thực hiện</p>
                    <p className="font-bold text-slate-800">{fmtDate(selectedTransaction.ngayGiaoDich)}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mô tả / Nội dung</p>
                  <p className="text-slate-700 leading-relaxed font-semibold">{selectedTransaction.moTa || "Không có mô tả chi tiết."}</p>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</p>
                    <span className="inline-flex px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-black">
                       {selectedTransaction.danhMuc?.tenDanhMuc || "Chưa phân loại"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Từ ví tiền</p>
                    <p className="font-bold text-slate-800">{selectedTransaction.viTien?.tenVi || "Mặc định"}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full rounded-2xl h-14 bg-slate-900 hover:bg-black text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
                    onClick={() => {
                        setSelectedTransaction(null);
                        handleExportSingle(selectedTransaction.id, selectedTransaction.moTa);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Xuất chứng từ PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Name Modal */}
      <Dialog open={showNameModal} onOpenChange={setShowNameModal}>
        <DialogContent className="sm:max-w-[480px] rounded-[24px] p-0 overflow-hidden border-0 bg-white shadow-2xl flex flex-col max-h-[90vh]">
          <div className="bg-slate-50/80 px-6 py-6 border-b border-slate-100 flex-shrink-0">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>
                Tùy chọn Báo cáo
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1.5 ml-1">
                Tùy chỉnh thông tin trước khi tải xuống hoặc chia sẻ qua email.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-hide">
            <div className="space-y-2">
              <Label htmlFor="fileName" className="text-[11px] font-bold text-slate-400 gap-1.5 flex items-center uppercase ml-1">
                <FileText className="w-3 h-3" />
                Tên báo cáo
              </Label>
              <div className="relative">
                <Input
                  id="fileName"
                  autoFocus
                  placeholder="Ví dụ: Bao_Cao_Thang_3"
                  className="h-11 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500 bg-white px-4 font-medium text-slate-900"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExport(pendingFormat!, true)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="receiverEmail" className="text-[11px] font-bold text-slate-400 gap-1.5 flex items-center uppercase ml-1">
                  <Mail className="w-3 h-3" />
                  Gửi tới (Email người nhận)
                </Label>
                <Input
                  id="receiverEmail"
                  type="email"
                  placeholder="Để trống nếu gửi cho chính mình..."
                  className="h-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white px-4 text-sm"
                  value={receiverEmail}
                  onChange={(e) => setReceiverEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customMessage" className="text-[11px] font-bold text-slate-400 gap-1.5 flex items-center uppercase ml-1">
                  <Sparkles className="w-3 h-3" />
                  Lời nhắn đính kèm
                </Label>
                <textarea
                  id="customMessage"
                  rows={2}
                  placeholder="Nhập lời nhắn của bạn tại đây..."
                  className="w-full rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 bg-white p-3 text-sm outline-none transition-all resize-none"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>
            </div>

            {isPreviewOn && pendingFormat !== 'single' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-violet-600 mb-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Tóm tắt dữ liệu sắp xuất</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-medium">Số giao dịch</p>
                    <p className="text-sm font-bold text-slate-700">{summary.count}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-medium">Tổng thu</p>
                    <p className="text-sm font-bold text-emerald-600">+{fmtVND(summary.income)}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-slate-400 font-medium">Tổng chi</p>
                    <p className="text-sm font-bold text-rose-600">-{fmtVND(summary.expense)}</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  * Dữ liệu dựa trên khoảng thời gian và bộ lọc bạn đang chọn.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowNameModal(false);
                setReportName("");
                setReceiverEmail("");
                setCustomMessage("");
                setPendingFormat(null);
                setPendingSingleId(null);
              }}
              className="rounded-xl text-slate-500 font-bold px-5 h-11"
            >
              Hủy
            </Button>
            
            <Button 
              variant="outline"
              disabled={isSendingEmail}
              className="rounded-xl border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 font-bold px-5 h-11 flex items-center gap-2"
              onClick={handleSendEmail}
            >
              {isSendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Gửi Mail
            </Button>

            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-11 font-bold shadow-lg shadow-violet-100 transition-all hover:-translate-y-0.5 flex items-center gap-2"
              onClick={() => handleExport(pendingFormat!, true)}
            >
              <Download className="w-4 h-4" />
              Tải xuống
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
             Phân tích Tài chính
            <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Pro</span>
          </h1>
          <p className="text-slate-500 mt-2">Theo dõi, phân tích và tối ưu hóa dòng tiền của bạn với dữ liệu trực quan.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          <Button 
            onClick={() => setShowAnalysisModal(true)}
            className="px-4 py-2 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-100 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 mr-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Phân tích 50/30/20
          </Button>

          {[
            { label: 'Hôm nay', value: 'today' },
            { label: '7 ngày qua', value: 'week' },
            { label: 'Tháng này', value: 'month' },
            { label: 'Từ đầu năm', value: 'year' },
            { label: '30 ngày qua', value: 'last30' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => handleSetPresetRange(preset.value as any)}
              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* 50/30/20 Analysis Modal */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="sm:max-w-[700px] rounded-[32px] p-0 overflow-hidden border-0 bg-white shadow-2xl flex flex-col max-h-[90vh]">
          <div className="bg-slate-900 px-8 py-10 text-white flex-shrink-0 relative overflow-hidden">
            <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-white/5 rotate-12" />
            <DialogHeader className="p-0 text-left relative z-10">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="w-5 h-5 text-violet-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.2em] text-violet-300">Advanced Analytics</span>
              </div>
              <DialogTitle className="text-3xl font-black tracking-tight">Chiến lược Tài chính 50/30/20</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-2 max-w-md">
                Phân bổ thông minh giúp bạn cân bằng cuộc sống hiện tại và xây dựng nền tảng vững chắc cho tương lai.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-10 scrollbar-hide">
            {!analysis503020 ? (
               <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-20" />
                  <p className="font-bold text-lg">Chưa có dữ liệu chi tiêu</p>
                  <p className="text-sm">Hãy thêm giao dịch chi tiêu để bắt đầu phân tích.</p>
               </div>
            ) : (
              <>
                {/* Visual Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analysis503020.result}
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {analysis503020.result.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(v: number) => fmtVND(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-center -mt-36">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tổng chi tiêu</p>
                       <p className="text-xl font-black text-slate-900">{fmtVND(analysis503020.totalExp)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">So sánh Thực tế vs Mục tiêu</h4>
                     {analysis503020.result.map((group, i) => (
                       <div key={i} className="space-y-2">
                          <div className="flex justify-between items-end">
                             <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: group.color}} />
                                <p className="text-xs font-bold text-slate-700">{group.name}</p>
                             </div>
                             <p className="text-xs font-black text-slate-900">{group.percent.toFixed(1)}%</p>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative">
                             <div className="absolute inset-0 bg-slate-200/50 w-[50%] z-0 border-r border-white/50" style={{width: `${group.targetPercent}%`}} />
                             <div 
                                className="h-full rounded-full relative z-10 transition-all duration-1000" 
                                style={{width: `${group.percent}%`, backgroundColor: group.color}} 
                             />
                          </div>
                       </div>
                     ))}
                     <p className="text-[10px] text-slate-400 italic mt-4">
                        * Vùng màu xám nhạt thể hiện tỷ lệ mục tiêu (50% - 30% - 20%).
                     </p>
                  </div>
                </div>

                <div className="h-px bg-slate-100" />

                {/* Intelligence & Advice */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Đánh giá Chiến thuật & Gợi ý</h4>
                  <div className="grid grid-cols-1 gap-4">
                    {analysis503020.result.map((group, i) => (
                      <div key={i} className={`p-5 rounded-[24px] border transition-all ${group.status === 'Vượt ngưỡng' ? 'bg-rose-50/50 border-rose-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                         <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-xl bg-white shadow-sm ${group.status === 'Vượt ngưỡng' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {group.status === 'Vượt ngưỡng' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                               </div>
                               <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{group.name.split(' (')[0]}</p>
                                  <p className={`text-sm font-black ${group.status === 'Vượt ngưỡng' ? 'text-rose-600' : 'text-emerald-600'}`}>{group.status}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[10px] font-bold text-slate-400">Chi tiêu thực tế</p>
                               <p className="text-sm font-black text-slate-800">{fmtVND(group.value)}</p>
                            </div>
                         </div>
                         <p className="text-xs text-slate-600 leading-relaxed pl-12 font-medium">
                            {group.advice}
                         </p>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="bg-indigo-50 border-indigo-100 p-6 rounded-[24px]">
                   <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                         <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                         <h5 className="font-black text-indigo-900 text-sm mb-1 uppercase tracking-tight">Kế hoạch hành động kế tiếp</h5>
                         <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                            {analysis503020.result[2].percent < 20 
                              ? "Ưu tiên hàng đầu của bạn ngay lúc này là tăng tỷ lệ Tích lũy. Hãy thử cắt giảm 10% ngân sách ở phần 'Sở thích' để chuyển vào quỹ tiết kiệm."
                              : "Bạn đang làm rất tốt! Hãy tiếp tục duy trì kỷ luật này và xem xét chuyển một phần tích lũy sang kênh đầu tư có lãi suất cao hơn."}
                         </p>
                      </div>
                   </div>
                </Card>
              </>
            )}
          </div>

          <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex-shrink-0 flex justify-center">
             <Button 
                onClick={() => setShowAnalysisModal(false)}
                className="rounded-2xl h-12 px-10 bg-slate-900 text-white font-black text-sm uppercase tracking-widest hover:bg-black transition-all"
             >
                Đã hiểu, tiếp tục
             </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Financial Status Overview Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { 
            label: "Thay đổi ròng", 
            value: summary.income - summary.expense, 
            color: (summary.income - summary.expense) >= 0 ? "text-emerald-600" : "text-rose-600",
            bg: (summary.income - summary.expense) >= 0 ? "bg-emerald-50" : "bg-rose-50",
            icon: <Sparkles className="w-4 h-4" />
          },
          { 
            label: "Tổng thu nhập", 
            value: summary.income, 
            color: "text-emerald-600", 
            bg: "bg-emerald-50",
            icon: <ArrowDownLeft className="w-4 h-4" />
          },
          { 
            label: "Tổng chi tiêu", 
            value: summary.expense, 
            color: "text-rose-600", 
            bg: "bg-rose-50",
            icon: <ArrowUpRight className="w-4 h-4" />
          },
          { 
            label: "Hạng mục chi nhiều nhất", 
            value: chartData.categoryData[0]?.name || "N/A", 
            isCurrency: false,
            color: "text-violet-600",
            bg: "bg-violet-50",
            icon: <FileText className="w-4 h-4" />
          }
        ].map((tile, i) => (
          <Card key={i} className="border-0 shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${tile.bg} ${tile.color} flex items-center justify-center`}>
                {tile.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{tile.label}</p>
                <p className={`text-lg font-black ${tile.color}`}>
                  {tile.isCurrency === false ? tile.value : fmtVND(tile.value as number)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <div className="w-1.5 h-4 bg-violet-600 rounded-full" />
              Biến động dòng tiền (Thu vs Chi)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4">
            {isFetching ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-xs">Đang tải dữ liệu biểu đồ...</p>
              </div>
            ) : filteredList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.dailyTrendData}>
                  <defs>
                    <linearGradient id="colorThu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorChi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fill: '#94a3b8'}}
                    tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val.toString()}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0(0 / 0.1)' }}
                    formatter={(val: number) => fmtVND(val)}
                  />
                  <Area type="monotone" dataKey="thu" name="Thu nhập" stroke="#10b981" fillOpacity={1} fill="url(#colorThu)" strokeWidth={2} />
                  <Area type="monotone" dataKey="chi" name="Chi tiêu" stroke="#ef4444" fillOpacity={1} fill="url(#colorChi)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-xs text-center px-6">
                <AlertCircle className="w-8 h-8 mb-2 opacity-20" />
                Không có dữ liệu thu chi trong khoảng thời gian này.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution Chart */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-tight">
              <div className="w-1.5 h-4 bg-pink-500 rounded-full" />
              Phân bổ chi tiêu
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full pt-4 relative">
            {isFetching ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin mb-2" />
                <p className="text-[10px]">Đang xử lý...</p>
              </div>
            ) : chartData.categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(val: number) => fmtVND(val)}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: 10, paddingTop: 10}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-xs text-center px-6">
                Chưa có dữ liệu chi tiêu trong khoảng thời gian này để phân tích.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Options Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-violet-500" />
              Chọn khoảng thời gian
            </CardTitle>
            <CardDescription>Dữ liệu báo cáo sẽ được lọc theo khoảng thời gian bạn chọn bên dưới.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="grid w-full sm:w-auto items-center gap-1.5">
                <label htmlFor="startDate" className="text-sm font-medium text-slate-700">Từ ngày</label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
                />
              </div>
              <div className="grid w-full sm:w-auto items-center gap-1.5">
                <label htmlFor="endDate" className="text-sm font-medium text-slate-700">Đến ngày</label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all"
                />
              </div>
              <div className="grid w-full sm:w-auto items-center gap-1.5 focus-within:z-10 relative">
                <label className="text-sm font-medium text-slate-700">Ví / Số dư</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="flex h-10 w-full sm:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 transition-all font-medium text-slate-700"
                >
                  <option value="all">Tất cả ví</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.tenVi}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-violet-500" />
              Loại báo cáo
            </CardTitle>
            <CardDescription>Chọn định kỳ báo cáo muốn xuất.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setReportType('monthly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  reportType === 'monthly' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Hàng tháng
              </button>
              <button
                onClick={() => setReportType('yearly')}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  reportType === 'yearly' 
                    ? 'bg-white text-violet-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                Hàng năm
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Tools & Exports */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Export Data Section */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Download className="w-5 h-5 text-violet-600" />
              Công cụ Xuất dữ liệu
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Excel Card */}
            <Card className="group hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-100">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-base font-bold">Báo cáo Excel chi tiết</CardTitle>
                <CardDescription className="text-xs">Phân tích chuyên sâu với số liệu thô.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleExport('excel')}
                  disabled={loading.excel}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-emerald-100"
                >
                  {loading.excel ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Tải xuống .XLSX
                </Button>
              </CardContent>
            </Card>

            {/* PDF Card */}
            <Card className="group hover:border-rose-200 transition-all duration-300 shadow-sm hover:shadow-md border border-slate-100">
              <CardHeader className="pb-2">
                <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <FileText className="w-6 h-6 text-rose-600" />
                </div>
                <CardTitle className="text-base font-bold">Báo cáo PDF chuyên nghiệp</CardTitle>
                <CardDescription className="text-xs">Trình bày đẹp mắt với biểu đồ tổng hợp.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => handleExport('pdf')}
                  disabled={loading.pdf}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-11 font-bold transition-all shadow-lg shadow-rose-100"
                >
                  {loading.pdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Tải xuống .PDF
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-0 shadow-sm bg-slate-50/50 p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-end">
              <div className="grid w-full sm:w-auto items-center gap-1.5 flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lọc theo Ví</label>
                <select
                  value={selectedWallet}
                  onChange={(e) => setSelectedWallet(e.target.value)}
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:ring-2 focus:ring-violet-500/20 outline-none transition-all font-bold text-slate-700"
                >
                  <option value="all">Tất cả ví tài chính</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.tenVi}</option>
                  ))}
                </select>
              </div>
              <div className="grid w-full sm:w-auto items-center gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kỳ báo cáo</label>
                <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
                  <button onClick={() => setReportType('monthly')} className={`px-4 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${reportType === 'monthly' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400'}`}>Tháng</button>
                  <button onClick={() => setReportType('yearly')} className={`px-4 py-2 text-[11px] font-bold uppercase rounded-lg transition-all ${reportType === 'yearly' ? 'bg-violet-600 text-white shadow-md' : 'text-slate-400'}`}>Năm</button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Comparison Area */}
        <div className="lg:col-span-4">
          <div className="h-full flex flex-col space-y-6">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              So sánh Kỳ
            </h3>
            
            <Card className="flex-1 border border-indigo-100 shadow-sm bg-white overflow-hidden flex flex-col">
              <CardContent className="p-5 flex flex-col h-full space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-4 h-4 rounded bg-violet-100 text-violet-600 flex items-center justify-center text-[8px]">1</div>
                      Kỳ gốc
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={compStart1} onChange={e => setCompStart1(e.target.value)} className="w-full h-10 px-3 border border-slate-100 bg-slate-50/50 rounded-lg text-xs font-bold outline-none" />
                      <input type="date" value={compEnd1} onChange={e => setCompEnd1(e.target.value)} className="w-full h-10 px-3 border border-slate-100 bg-slate-50/50 rounded-lg text-xs font-bold outline-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <div className="w-4 h-4 rounded bg-rose-100 text-rose-600 flex items-center justify-center text-[8px]">2</div>
                      Kỳ so sánh
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" value={compStart2} onChange={e => setCompStart2(e.target.value)} className="w-full h-10 px-3 border border-slate-100 bg-slate-50/50 rounded-lg text-xs font-bold outline-none" />
                      <input type="date" value={compEnd2} onChange={e => setCompEnd2(e.target.value)} className="w-full h-10 px-3 border border-slate-100 bg-slate-50/50 rounded-lg text-xs font-bold outline-none" />
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50">
                  <Button 
                    onClick={handleExportComparison}
                    disabled={loadingComparison}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-bold transition-all shadow-lg shadow-indigo-100"
                  >
                    {loadingComparison ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Xuất PDF So sánh
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* New Section: Individual Transaction Search & Export */}
      <div className="mt-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Xuất báo cáo theo giao dịch</h3>
            <p className="text-sm text-slate-500">Tìm kiếm và xuất chứng từ PDF cho từng giao dịch cụ thể.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mô tả..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Advanced Filters Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Tháng</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <option value="all">Tất cả tháng</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Năm</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
            >
              <option value="all">Tất cả năm</option>
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Tiền từ</label>
            <input
              type="number"
              placeholder="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Đến</label>
            <input
              type="number"
              placeholder="999,999,999"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500/20 outline-none"
            />
          </div>
        </div>

        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Giao dịch</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">D.Mục</th>
                  <th className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ngày</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Số tiền</th>
                  <th className="px-6 py-3 text-right text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions
                  .filter(gd => {
                    const matchesSearch = gd.moTa.toLowerCase().includes(searchKeyword.toLowerCase());
                    const d = new Date(gd.ngayGiaoDich);
                    const matchesMonth = filterMonth === 'all' || (d.getMonth() + 1).toString() === filterMonth;
                    const matchesYear = filterYear === 'all' || d.getFullYear().toString() === filterYear;
                    const val = gd.soTien;
                    const matchesMin = minAmount === "" || val >= parseFloat(minAmount);
                    const matchesMax = maxAmount === "" || val <= parseFloat(maxAmount);
                    return matchesSearch && matchesMonth && matchesYear && matchesMin && matchesMax;
                  })
                  .slice(0, 5) 
                  .map(gd => (
                    <tr key={gd.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${gd.loai === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {gd.loai === 'income' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                          </div>
                          <span className="font-medium text-slate-700 truncate max-w-[150px]">{gd.moTa || "Không mô tả"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                          {gd.danhMuc?.tenDanhMuc || "Khác"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{fmtDate(gd.ngayGiaoDich)}</td>
                      <td className={`px-6 py-4 text-right font-bold ${gd.loai === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {gd.loai === 'income' ? '+' : '-'}{fmtVND(gd.soTien)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedTransaction(gd)}
                          className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportSingle(gd.id, gd.moTa)}
                          disabled={isExportingSingle === gd.id}
                          className="p-2 text-violet-600 hover:bg-violet-50 rounded-lg transition-all disabled:opacity-50"
                          title="Xuất PDF"
                        >
                          {isExportingSingle === gd.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      Không tìm thấy giao dịch nào trong khoảng thời gian này.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Floating Notification Popup */}
      {message.text && (
        <div className={`fixed top-8 right-8 z-[100] min-w-[320px] max-w-md p-4 rounded-[20px] shadow-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-8 duration-500 ease-out backdrop-blur-md ${
          message.type === 'success' 
            ? 'bg-emerald-50/95 text-emerald-800 border-emerald-100 shadow-emerald-200/40' 
            : 'bg-rose-50/95 text-rose-800 border-rose-100 shadow-rose-200/40'
        }`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            message.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-60 mb-0.5">
              {message.type === 'success' ? 'Thành công' : 'Thông báo lỗi'}
            </p>
            <p className="text-sm font-bold leading-tight">{message.text}</p>
          </div>
          <button 
            onClick={() => setMessage({ text: '', type: null })}
            className="hover:bg-black/5 p-1.5 rounded-full transition-colors"
          >
            <svg className="w-4 h-4 opacity-40 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}


    </div>
  )
}
