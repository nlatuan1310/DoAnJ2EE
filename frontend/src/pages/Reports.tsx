
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
  Trash2
} from "lucide-react"
import { format } from "date-fns"
import api, { reportsApi, getCurrentUserId } from "@/services/api";
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

interface Report {
  id: string;
  loai: string;
  dinhDang: string;
  fileUrl: string;
  ngayTao: string;
}


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
  const [history, setHistory] = useState<Report[]>([])
  const [transactions, setTransactions] = useState<GiaoDich[]>([])
  const [searchKeyword, setSearchKeyword] = useState("")
  const [isExportingSingle, setIsExportingSingle] = useState<string | null>(null)
  const [showNameModal, setShowNameModal] = useState(false)
  const [pendingFormat, setPendingFormat] = useState<'excel' | 'pdf' | 'single' | null>(null)
  const [pendingSingleId, setPendingSingleId] = useState<string | null>(null)
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null)

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
      const token = localStorage.getItem("token")
      
      let url = "";
      if (pendingFormat === 'single') {
        if (!pendingSingleId) throw new Error("ID giao dịch không hợp lệ");
        const queryParams = new URLSearchParams({
          emailNhan: receiverEmail,
          noiDung: customMessage
        }).toString();
        url = `http://localhost:8080/api/reports/export/transaction/${pendingSingleId}/email?${queryParams}`;
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
        url = `http://localhost:8080/api/reports/export/email?${queryParams.toString()}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error("Gửi email thất bại");
      
      setMessage({ text: receiverEmail ? `Báo cáo đã được gửi tới ${receiverEmail}!` : "Báo cáo đã được gửi tới email của bạn!", type: 'success' })
      setShowNameModal(false)
      setReportName("")
      setReceiverEmail("")
      setCustomMessage("")
      fetchHistory()
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

  const fetchHistory = async () => {
    try {
      const res = await reportsApi.getHistory();
      setHistory(res.data);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử báo cáo:", err);
    }
  };

  const fetchTransactions = async () => {
    const uid = getCurrentUserId();
    if (!uid) return;
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
    fetchHistory();
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
      const token = localStorage.getItem("token")
      const startDateTime = `${startDate}T00:00:00`
      const endDateTime = `${endDate}T23:59:59`
      const viParam = selectedWallet !== 'all' ? `&viId=${selectedWallet}` : ''
      
      const response = await fetch(
        `http://localhost:8080/api/reports/export/${formatType}?start=${startDateTime}&end=${endDateTime}&loai=${reportType}&tenBaoCao=${encodeURIComponent(reportName)}${viParam}`,

        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Lỗi khi xuất báo cáo: ${response.statusText}`)
      }

      const blob = await response.blob()
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
      fetchHistory(); 
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
      const token = localStorage.getItem("token")
      const response = await fetch(
        `http://localhost:8080/api/reports/export/transaction/${gdId}?tenBaoCao=${encodeURIComponent(reportName)}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      if (!response.ok) throw new Error("Thao tác thất bại");
      const blob = await response.blob()
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
      fetchHistory();
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
      const token = localStorage.getItem("token")
      const startDateTime1 = `${compStart1}T00:00:00`
      const endDateTime1 = `${compEnd1}T23:59:59`
      const startDateTime2 = `${compStart2}T00:00:00`
      const endDateTime2 = `${compEnd2}T23:59:59`
      const viParam = selectedWallet !== 'all' ? `&viId=${selectedWallet}` : ''
      
      const response = await fetch(
        `http://localhost:8080/api/reports/export/comparison/pdf?start1=${startDateTime1}&end1=${endDateTime1}&start2=${startDateTime2}&end2=${endDateTime2}${viParam}`,
        {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )

      if (!response.ok) {
        throw new Error(`Lỗi khi xuất báo cáo so sánh`)
      }

      const blob = await response.blob()
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
      fetchHistory(); 
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error.message || 'Có lỗi xảy ra khi tải báo cáo.', type: 'error' })
    } finally {
      setLoadingComparison(false)
    }
  }


  const handleDownload = async (report: Report) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/reports/download/${report.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Không thể tải file");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.fileUrl.split('/').pop() || "report";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setMessage({ text: "Lỗi khi tải lại báo cáo. File có thể không còn tồn tại trên server.", type: 'error' });
    }
  };

  const handleDeleteReport = (e: React.MouseEvent, reportId: string) => {
    e.stopPropagation(); // Ngăn sự kiện click vào card (tải file)
    setDeleteReportId(reportId);
  };

  const confirmDeleteReport = async (reportId: string) => {
    try {
      await reportsApi.delete(reportId);
      setMessage({ text: "Đã xóa lịch sử báo cáo thành công.", type: 'success' });
      fetchHistory();
    } catch (err) {
      console.error(err);
      setMessage({ text: "Không thể xóa báo cáo. Vui lòng thử lại.", type: 'error' });
    } finally {
      setDeleteReportId(null);
    }
  };

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
      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteReportId} onOpenChange={(open) => !open && setDeleteReportId(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-[24px] p-6 bg-white overflow-hidden shadow-2xl border-0">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-2">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-slate-800">Xác nhận xóa</DialogTitle>
              <DialogDescription className="text-slate-500 text-sm">
                Bạn có chắc chắn muốn xóa bản ghi báo cáo này không? Hành động này không thể hoàn tác.
              </DialogDescription>
            </div>
            <div className="flex gap-3 w-full pt-4">
              <Button 
                variant="outline" 
                onClick={() => setDeleteReportId(null)}
                className="flex-1 rounded-xl h-12 font-bold text-slate-600 border-slate-200 hover:bg-slate-50 transition-all font-sans"
              >
                Hủy bỏ
              </Button>
              <Button 
                onClick={() => {
                  if (deleteReportId) {
                    confirmDeleteReport(deleteReportId);
                  }
                }}
                className="flex-1 rounded-xl h-12 font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-200 transition-all font-sans"
              >
                Xóa ngay
              </Button>
            </div>
          </div>
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trung tâm Báo cáo</h1>
        <p className="text-slate-500 mt-2">Xuất dữ liệu tài chính của bạn ra các định dạng phổ biến để lưu trữ hoặc phân tích sâu hơn.</p>
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

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excel Export Card */}
        <Card className="group hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-7 h-7 text-emerald-600" />
            </div>
            <CardTitle className="text-xl">Báo cáo Excel (.xlsx)</CardTitle>
            <CardDescription>
              Bao gồm toàn bộ danh sách giao dịch chi tiết, phân loại và ghi chú. Thích hợp để tính toán và xử lý dữ liệu nâng cao.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => handleExport('excel')}
              disabled={loading.excel}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading.excel ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Tải xuống Excel
                </>
              )}
            </button>
          </CardContent>
        </Card>

        {/* PDF Export Card */}
        <Card className="group hover:border-rose-200 transition-all duration-300 shadow-sm hover:shadow-md">
          <CardHeader>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-rose-600" />
            </div>
            <CardTitle className="text-xl">Báo cáo PDF trực quan</CardTitle>
            <CardDescription>
              Báo cáo tổng hợp với các biểu đồ trực quan, phân tích thu chi và tóm tắt dòng tiền. Hoàn hảo để trình bày hoặc lưu trữ.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => handleExport('pdf')}
              disabled={loading.pdf}
              className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading.pdf ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Tải xuống PDF
                </>
              )}
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Comparison Report Section */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900">Báo cáo So sánh (Comparison Report)</h3>
        <p className="text-sm text-slate-500 mb-6">So sánh dữ liệu thu chi giữa hai khoảng thời gian để đánh giá sự tăng trưởng hoặc giảm sút.</p>
        
        <Card className="border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Kỳ 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-violet-50/50 p-3 rounded-lg border border-violet-100/50">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shadow-sm">1</div>
                  <h4 className="font-bold text-slate-800">Khoảng thời gian thứ nhất</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Từ ngày</label>
                    <input type="date" value={compStart1} onChange={e => setCompStart1(e.target.value)} className="w-full h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Đến ngày</label>
                    <input type="date" value={compEnd1} onChange={e => setCompEnd1(e.target.value)} className="w-full h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Kỳ 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold shadow-sm">2</div>
                  <h4 className="font-bold text-slate-800">Khoảng thời gian thứ hai</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Từ ngày</label>
                    <input type="date" value={compStart2} onChange={e => setCompStart2(e.target.value)} className="w-full h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all shadow-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700 ml-1">Đến ngày</label>
                    <input type="date" value={compEnd2} onChange={e => setCompEnd2(e.target.value)} className="w-full h-11 px-4 border border-slate-200 bg-slate-50 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all shadow-sm" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleExportComparison}
                disabled={loadingComparison}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-violet-200 disabled:opacity-50 hover:-translate-y-0.5"
              >
                {loadingComparison ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
                Tải xuống PDF So sánh
              </button>
            </div>
          </CardContent>
        </Card>
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
                      <td className="px-6 py-4 text-right">
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

      {/* Preview Section - Mockup */}
      {/* Recent Reports Section */}
      <div className="mt-12">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Mẫu báo cáo gần đây</h3>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
            <FileText className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Chưa có báo cáo nào được xuất.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {history.slice(0, 8).map(report => (
              <div 
                key={report.id} 
                className="group relative p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleDownload(report)}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDeleteReport(e, report.id)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-rose-100 rounded-full shadow-lg flex items-center justify-center text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all z-10 scale-90 group-hover:scale-100"
                  title="Xóa bản ghi này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <h4 className="font-bold text-slate-800 text-sm truncate pr-4">
                  {(() => {
                    if (!report.fileUrl) return `Báo cáo ${report.loai === 'monthly' ? 'Tháng' : 'Năm'}`;
                    const fileName = report.fileUrl.split('/').pop() || "";
                    const parts = fileName.split('_');
                    if (parts.length > 1) {
                      // Bỏ phần cuối cùng (thường là UUID + extension)
                      return parts.slice(0, -1).join('_');
                    }
                    return fileName.split('.')[0] || `Báo cáo ${report.loai === 'monthly' ? 'Tháng' : 'Năm'}`;
                  })()}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  {report.ngayTao ? (
                    (() => {
                      const d = new Date(report.ngayTao);
                      return isNaN(d.getTime()) ? "Ngày không hợp lệ" : format(d, 'dd/MM/yyyy HH:mm');
                    })()
                  ) : "Ngày không xác định"}
                </p>
                <div className="mt-3 flex items-center gap-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                    report.dinhDang === 'xlsx' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}>
                    {report.dinhDang}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
