import { useState } from "react"
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
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"

export default function Reports() {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState<{ excel: boolean; pdf: boolean }>({
    excel: false,
    pdf: false
  })
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null
  })

  const handleExport = async (formatType: 'excel' | 'pdf') => {
    setLoading(prev => ({ ...prev, [formatType]: true }))
    setMessage({ text: '', type: null })

    try {
      const token = localStorage.getItem("token")
      const startDateTime = `${startDate}T00:00:00`
      const endDateTime = `${endDate}T23:59:59`
      
      const response = await fetch(
        `http://localhost:8080/api/reports/export/${formatType}?start=${startDateTime}&end=${endDateTime}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Lỗi khi xuất báo cáo: ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BaoCao_${formatType === 'excel' ? 'Excel' : 'PDF'}_${format(new Date(), 'yyyyMMdd')}.${formatType === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setMessage({ text: `Xuất báo cáo ${formatType.toUpperCase()} thành công!`, type: 'success' })
    } catch (error: any) {
      console.error(error)
      setMessage({ text: error.message || 'Có lỗi xảy ra khi tải báo cáo.', type: 'error' })
    } finally {
      setLoading(prev => ({ ...prev, [formatType]: false }))
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trung tâm Báo cáo</h1>
        <p className="text-slate-500 mt-2">Xuất dữ liệu tài chính của bạn ra các định dạng phổ biến để lưu trữ hoặc phân tích sâu hơn.</p>
      </div>

      {/* Date Range Selection */}
      <Card className="mb-8 border-slate-200 shadow-sm">
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
          </div>
        </CardContent>
      </Card>

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

      {/* Notification Message */}
      {message.text && (
        <div className={`mt-8 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      {/* Preview Section - Mockup */}
      <div className="mt-12 opacity-50 grayscale select-none pointer-events-none">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Mẫu báo cáo gần đây</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center">
              <FileText className="w-8 h-8 text-slate-300" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
