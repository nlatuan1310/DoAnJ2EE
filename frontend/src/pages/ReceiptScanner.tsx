import { useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ScanLine, Save, FileText, Camera } from "lucide-react";
import api from "@/services/api";

export default function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tenCuaHang: "",
    ngayGiaoDich: "",
    tongTien: "",
    ghiChu: ""
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
      setSuccessMsg(null);
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    
    const d = new FormData();
    d.append("file", file);

    try {
      const response = await api.post("/ai/receipt/scan", d, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data;
      setResult(data);
      setFormData({
        tenCuaHang: data.tenCuaHang || "",
        ngayGiaoDich: data.ngayGiaoDich || "",
        tongTien: data.tongTien ? data.tongTien.toString() : "",
        ghiChu: data.ghiChu || ""
      });
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("Giao dịch đã được lưu thành công!");
    }, 1000);
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ScanLine className="w-8 h-8 text-violet-600" /> Quét Hóa Đơn AI
          </h1>
          <p className="text-slate-500 mt-2">Dùng trí tuệ nhân tạo để tự động trích xuất thông tin hóa đơn nhanh chóng.</p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-200 flex items-center gap-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <p className="font-medium">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 text-rose-700 p-4 rounded-xl border border-rose-200 flex items-center gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Upload */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Camera className="w-5 h-5 text-slate-400" /> Tải lên hóa đơn
            </h2>
            
            <label 
              htmlFor="dropzone-file" 
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-violet-400 transition-all group overflow-hidden"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6 w-full h-full">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 mb-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                    <p className="mb-2 text-sm text-slate-600 font-medium">Click để chọn ảnh</p>
                    <p className="text-xs text-slate-400">PNG, JPG, WEBP (Tối đa 5MB)</p>
                  </>
                )}
              </div>
              <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>

            <button
              onClick={handleScan}
              disabled={!file || loading}
              className={`mt-6 w-full py-3 px-4 rounded-xl font-semibold text-white shadow-md transition-all flex items-center justify-center gap-2
                ${!file || loading 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/30'}`}
            >
              {loading && !result ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  AI Đang phân tích...
                </span>
              ) : (
                <>
                  <ScanLine className="w-5 h-5" /> Phân Tích Bằng AI
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Col: Form & Results */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full min-h-[500px] flex flex-col">
            <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Kết quả trích xuất
            </h2>

            {!result && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <ScanLine className="w-16 h-16 mb-4 opacity-20" />
                <p>Tải ảnh lên và bấm Phân Tích để xem kết quả.</p>
              </div>
            )}

            {loading && !result && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 animate-pulse">
                <div className="w-16 h-16 mb-4 rounded-full border-4 border-violet-100 border-t-violet-600 animate-spin"></div>
                <p>Chatbot AI đang hì hục đọc hóa đơn...</p>
              </div>
            )}

            {result && (
              <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Tên Cửa Hàng</label>
                    <input 
                      type="text" 
                      value={formData.tenCuaHang}
                      onChange={(e) => setFormData({...formData, tenCuaHang: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                      placeholder="VD: Winmart+"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Ngày Giao Dịch</label>
                    <input 
                      type="text" 
                      value={formData.ngayGiaoDich}
                      onChange={(e) => setFormData({...formData, ngayGiaoDich: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all"
                      placeholder="VD: 24/10/2026"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Tổng Tiền (VNĐ)</label>
                    <input 
                      type="number" 
                      value={formData.tongTien}
                      onChange={(e) => setFormData({...formData, tongTien: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all text-xl font-bold text-violet-700"
                      placeholder="VD: 150000"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Ghi Chú</label>
                    <textarea 
                      value={formData.ghiChu}
                      onChange={(e) => setFormData({...formData, ghiChu: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all min-h-[80px]"
                      placeholder="Thông tin thêm..."
                    />
                  </div>
                </div>

                {result.danhSachSanPham && result.danhSachSanPham.length > 0 && (
                  <div className="mb-8">
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Chi tiết sản phẩm</label>
                    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Sản phẩm</th>
                            <th className="px-4 py-3 text-center">SL</th>
                            <th className="px-4 py-3 text-right">Giá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {result.danhSachSanPham.map((item: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-100/50 transition-colors">
                              <td className="px-4 py-3 text-slate-800 font-medium">{item.tenSanPham || 'N/A'}</td>
                              <td className="px-4 py-3 text-center text-slate-600">{item.soLuong || 1}</td>
                              <td className="px-4 py-3 text-right text-slate-600 font-medium">
                                {item.thanhTien ? new Intl.NumberFormat('vi-VN').format(item.thanhTien) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                    ) : (
                      <>
                        <Save className="w-5 h-5" /> Lưu Giao Dịch
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
