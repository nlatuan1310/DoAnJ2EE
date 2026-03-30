import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScrollText, AlertCircle } from "lucide-react";
import { adminNhatKyApi } from "@/services/adminService";

export default function AdminAuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const size = 10;

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const fetchLogs = async (pageNumber: number) => {
    setLoading(true);
    try {
      const resp = await adminNhatKyApi.getPhanTrang(pageNumber, size);
      setLogs(resp.data.content);
      setTotalPages(resp.data.totalPages);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getHanhDongStyle = (hanhDong: string) => {
    if (hanhDong.includes("XOA")) return "bg-rose-100 text-rose-700";
    if (hanhDong.includes("TAO")) return "bg-emerald-100 text-emerald-700";
    if (hanhDong.includes("CAP_NHAT")) return "bg-amber-100 text-amber-700";
    if (hanhDong.includes("KHOA")) return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Nhật ký Hoạt động</h1>
        <p className="text-sm text-slate-500 mt-1">Lịch sử giám sát các thao tác của quản trị viên hệ thống</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="py-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-violet-500"/>
            Audit Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Đang tải nhật ký...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <AlertCircle className="w-10 h-10 mb-3 text-slate-300" />
              <p className="font-medium text-center">Chưa có nhật ký hoạt động nào.</p>
            </div>
          ) : (
             <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Thời gian</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Người thực hiện</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Hành động</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500">Bảng dữ liệu</th>
                    <th className="text-left px-6 py-3 font-semibold text-slate-500 hidden sm:table-cell">Đối tượng ID</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {new Date(log.ngayTao).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-800">
                                {log.admin?.hoVaTen || "Hệ thống"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400">{log.admin?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider ${getHanhDongStyle(log.hanhDong)}`}>
                          {log.hanhDong.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs px-2 py-1 bg-slate-100 rounded text-slate-600">
                          {log.bangDuLieu || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 hidden sm:table-cell">
                        {log.doiTuongId ? log.doiTuongId.substring(0, 8) + '...' : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phân trang */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <span className="text-sm text-slate-500">
                    Hiển thị trang {page + 1} / {totalPages === 0 ? 1 : totalPages}
                </span>
                <div className="flex gap-2">
                    <button 
                       disabled={page === 0}
                       onClick={() => setPage(p => p - 1)}
                       className="px-3 py-1.5 text-sm rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                        Trước
                    </button>
                    <button 
                       disabled={page >= totalPages - 1}
                       onClick={() => setPage(p => p + 1)}
                       className="px-3 py-1.5 text-sm rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition-colors">
                        Tiếp
                    </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
