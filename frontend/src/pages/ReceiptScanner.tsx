import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, ScanLine, Save, FileText, Camera, Wallet, X, Sparkles, Bot, Loader2 } from "lucide-react";
import api, { getCurrentUserId, autoCategorizeApi, danhMucApi } from "@/services/api";

interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  loai?: string;
}

export default function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);

  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{
    danhMucId: number;
    tenDanhMuc: string;
    doTinCay: number;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Modal form state (pre-filled from scan, editable by user)
  const [modalData, setModalData] = useState({
    moTa: "",
    soTien: "",
    loai: "expense",
    ngayGiaoDich: new Date().toISOString().slice(0, 16),
    viId: "",
    danhMucId: "",
  });

  // Scan result form (read-only display)
  const [formData, setFormData] = useState({
    tenCuaHang: "",
    ngayGiaoDich: "",
    tongTien: "",
    ghiChu: ""
  });

  // Fetch wallets & categories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const uid = getCurrentUserId();
        if (!uid) return;
        const [viRes, dmRes] = await Promise.all([
          api.get(`/vi-tien/nguoi-dung/${uid}`),
          danhMucApi.getAll(uid),
        ]);
        if (Array.isArray(viRes.data) && viRes.data.length > 0) {
          setWallets(viRes.data);
        }
        if (Array.isArray(dmRes.data)) {
          setCategories(dmRes.data);
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
      }
    };
    fetchData();
  }, []);

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

  // Open confirmation modal — pre-fill data from scan
  const handleOpenConfirmModal = () => {
    // Convert ngày dd/MM/yyyy → datetime-local format
    let ngay = new Date().toISOString().slice(0, 16);
    if (formData.ngayGiaoDich) {
      const parts = formData.ngayGiaoDich.split("/");
      if (parts.length === 3) {
        ngay = `${parts[2]}-${parts[1]}-${parts[0]}T12:00`;
      }
    }

    // Build danh sách sản phẩm từ kết quả scan
    const dsSanPham = result?.danhSachSanPham?.length > 0
      ? result.danhSachSanPham
          .map((sp: any) => sp.tenSanPham)
          .filter(Boolean)
          .join(", ")
      : "";

    let moTa = "";
    if (formData.tenCuaHang) {
      moTa = `Mua hàng tại ${formData.tenCuaHang}`;
      if (dsSanPham) moTa += `: ${dsSanPham}`;
      if (formData.ghiChu) moTa += ` - ${formData.ghiChu}`;
    } else if (dsSanPham) {
      moTa = `Mua: ${dsSanPham}`;
      if (formData.ghiChu) moTa += ` - ${formData.ghiChu}`;
    } else {
      moTa = formData.ghiChu || "Giao dịch từ quét hóa đơn";
    }

    setModalData({
      moTa,
      soTien: formData.tongTien,
      loai: "expense",
      ngayGiaoDich: ngay,
      viId: wallets.length > 0 ? wallets[0].id : "",
      danhMucId: "",
    });
    setSaveError(null);
    setAiSuggestion(null);
    setShowConfirmModal(true);
  };

  // AI Suggest Category
  const handleAiSuggest = async () => {
    if (!modalData.moTa.trim()) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await autoCategorizeApi.suggestCategory({
        moTa: modalData.moTa,
        loai: modalData.loai,
      });
      if (res.status === 200 && res.data) {
        setAiSuggestion(res.data);
        if (res.data.danhMucId) {
          setModalData((prev) => ({ ...prev, danhMucId: String(res.data.danhMucId) }));
        }
      }
    } catch (e) {
      console.error("AI suggest error:", e);
    } finally {
      setAiLoading(false);
    }
  };

  // Actual save
  const handleConfirmSave = async () => {
    setSaveError(null);
    if (!modalData.moTa.trim()) {
      setSaveError("Vui lòng nhập mô tả giao dịch");
      return;
    }
    if (!modalData.soTien || Number(modalData.soTien) <= 0) {
      setSaveError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    const viId = modalData.viId || (wallets.length > 0 ? wallets[0].id : "");
    if (!viId) {
      setSaveError("Bạn chưa có ví nào. Hãy tạo ví trước.");
      return;
    }

    setSaveLoading(true);
    try {
      const body = {
        soTien: Number(modalData.soTien),
        loai: modalData.loai,
        moTa: modalData.moTa,
        ngayGiaoDich: modalData.ngayGiaoDich,
      };

      if (modalData.danhMucId) {
        // User đã chọn danh mục cụ thể
        const uid = getCurrentUserId();
        await api.post(
          `/giao-dich?nguoiDungId=${uid}&viId=${viId}&danhMucId=${modalData.danhMucId}`,
          body
        );
      } else {
        // Để AI tự phân loại
        await autoCategorizeApi.createWithAutoCategory(viId, body);
      }

      setShowConfirmModal(false);
      setSuccessMsg("Giao dịch đã được lưu thành công!");
      setResult(null);
      setFile(null);
      setPreview(null);
      setFormData({ tenCuaHang: "", ngayGiaoDich: "", tongTien: "", ghiChu: "" });
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err.response?.data?.message || "Không thể lưu giao dịch. Vui lòng thử lại.");
    } finally {
      setSaveLoading(false);
    }
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
                    onClick={handleOpenConfirmModal}
                    disabled={loading}
                    className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" /> Lưu Giao Dịch
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MODAL: Xác nhận lưu giao dịch từ hóa đơn
          ═══════════════════════════════════════════ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Save className="w-5 h-5 text-violet-500" />
                Xác nhận lưu giao dịch
              </h2>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Mô tả */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Mô tả giao dịch
                </label>
                <input
                  type="text"
                  placeholder="VD: Mua hàng tại Winmart+..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                             outline-none transition-all placeholder:text-slate-400"
                  value={modalData.moTa}
                  onChange={(e) => setModalData({ ...modalData, moTa: e.target.value })}
                />
              </div>

              {/* Số tiền */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  placeholder="50000"
                  min="0"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                             outline-none transition-all placeholder:text-slate-400 text-lg font-bold text-violet-700"
                  value={modalData.soTien}
                  onChange={(e) => setModalData({ ...modalData, soTien: e.target.value })}
                />
              </div>

              {/* Loại */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Loại giao dịch
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalData({ ...modalData, loai: "expense", danhMucId: "" })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${modalData.loai === "expense"
                        ? "bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    ↗ Chi tiêu
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalData({ ...modalData, loai: "income", danhMucId: "" })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${modalData.loai === "income"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    ↙ Thu nhập
                  </button>
                </div>
              </div>

              {/* Ngày giao dịch */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ngày giao dịch
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  value={modalData.ngayGiaoDich}
                  onChange={(e) => setModalData({ ...modalData, ngayGiaoDich: e.target.value })}
                />
              </div>

              {/* Ví */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Wallet className="w-3.5 h-3.5" /> Ví
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             appearance-none outline-none cursor-pointer
                             focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  value={modalData.viId || (wallets.length > 0 ? wallets[0].id : "")}
                  onChange={(e) => setModalData({ ...modalData, viId: e.target.value })}
                >
                  {wallets.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.tenVi}
                    </option>
                  ))}
                  {wallets.length === 0 && <option value="">Chưa có ví</option>}
                </select>
              </div>

              {/* Danh mục + AI Suggest */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Danh mục
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                               appearance-none outline-none cursor-pointer
                               focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    value={modalData.danhMucId}
                    onChange={(e) => {
                      setModalData({ ...modalData, danhMucId: e.target.value });
                      setAiSuggestion(null);
                    }}
                  >
                    <option value="">— Để AI phân loại —</option>
                    {categories
                      .filter((c) => {
                        if (modalData.loai === "expense") return c.loai === "chi";
                        if (modalData.loai === "income") return c.loai === "thu";
                        return true;
                      })
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.tenDanhMuc}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !modalData.moTa.trim()}
                    className="flex items-center gap-1.5 px-3 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600
                               hover:from-violet-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg
                               transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm
                               hover:shadow-md active:scale-[0.98]"
                    title="AI gợi ý danh mục dựa trên mô tả"
                  >
                    {aiLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    AI
                  </button>
                </div>

                {/* AI Suggestion Result */}
                {aiSuggestion && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-50 to-purple-50
                                  border border-violet-200 rounded-lg animate-in fade-in slide-in-from-top-1">
                    <Bot className="w-4 h-4 text-violet-500 shrink-0" />
                    <span className="text-sm text-violet-700">
                      AI gợi ý: <strong>{aiSuggestion.tenDanhMuc}</strong>
                    </span>
                    <span className="ml-auto text-xs text-violet-500 font-medium">
                      {Math.round(aiSuggestion.doTinCay * 100)}% tin cậy
                    </span>
                  </div>
                )}
              </div>

              {/* Error */}
              {saveError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {saveError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100
                           rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={saveLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700
                           text-white text-sm font-medium rounded-lg transition-colors shadow-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                💾 Lưu giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
