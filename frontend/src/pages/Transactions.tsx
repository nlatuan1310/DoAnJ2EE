import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Tag,
  ArrowUpDown,
  Loader2,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  Plus,
  X,
  Sparkles,
  Bot,
  Clock,
} from "lucide-react";

import {
  layLichSuTimKiem,
  luuLichSuTimKiem,
  xoaLichSu,
  xoaTatCaLichSu,
  LichSuTimKiem,
} from "../services/searchHistoryService";

/* ═══════ TYPES ═══════ */
interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  loai?: string;
}

interface ViTien {
  id: string;
  tenVi: string;
}

interface GiaoDich {
  id: string;
  soTien: number;
  loai: string;
  moTa: string;
  ngayGiaoDich: string;
  ngayTao: string;
  aiCategorized?: boolean;
  danhMuc?: DanhMuc;
  viTien?: { id: string; tenVi: string };
}

import api, { getCurrentUserId, autoCategorizeApi } from "../services/api";

/* ═══════ CONFIG ═══════ */
const PAGE_SIZE = 10;

/* ═══════ HELPERS ═══════ */
const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const fmtDate = (iso: string) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/* ═══════════════════════════════════════════
   COMPONENT: Transactions (Advanced Search)
   ═══════════════════════════════════════════ */
export default function Transactions() {
  /* --- raw data from API --- */
  const [allGiaoDich, setAllGiaoDich] = useState<GiaoDich[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [wallets, setWallets] = useState<ViTien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* --- filter state --- */
  const [keyword, setKeyword] = useState("");
  const [debouncedKw, setDebouncedKw] = useState("");
  const [loai, setLoai] = useState("all");
  const [danhMucId, setDanhMucId] = useState("all");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  /* --- search history state --- */
  const [searchHistory, setSearchHistory] = useState<LichSuTimKiem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  /* --- pagination state --- */
  const [page, setPage] = useState(0);

  /* --- create transaction modal state --- */
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGD, setNewGD] = useState({
    moTa: "",
    soTien: "",
    loai: "expense",
    ngayGiaoDich: new Date().toISOString().slice(0, 16),
    viId: "",
    danhMucId: "",
  });
  const [aiSuggestion, setAiSuggestion] = useState<{
    danhMucId: number;
    tenDanhMuc: string;
    doTinCay: number;
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /* ──── 1) Debounce keyword 500ms ──── */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKw(keyword);
      setPage(0);
    }, 500);
    return () => clearTimeout(t);
  }, [keyword]);

  /* ──── 1a) Auto-save keyword khi debounce hoàn tất ──── */
  useEffect(() => {
    if (debouncedKw.trim()) {
      luuLichSuTimKiem(debouncedKw.trim())
        .then(() => fetchSearchHistory())
        .catch(() => {});
    }
  }, [debouncedKw]);

  /* ──── 1b) Fetch search history ──── */
  const fetchSearchHistory = useCallback(async () => {
    try {
      const data = await layLichSuTimKiem();
      setSearchHistory(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchSearchHistory();
  }, [fetchSearchHistory]);

  /* ──── 1c) Click-outside to close history dropdown ──── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectHistory = (tuKhoa: string) => {
    setKeyword(tuKhoa);
    setShowHistory(false);
  };

  const handleDeleteHistory = async (id: string) => {
    try {
      await xoaLichSu(id);
      setSearchHistory((prev) => prev.filter((h) => h.id !== id));
    } catch { /* silent */ }
  };

  const handleClearAllHistory = async () => {
    try {
      await xoaTatCaLichSu();
      setSearchHistory([]);
    } catch { /* silent */ }
  };

  /* ──── 2) Fetch data từ Backend (1 lần) ──── */
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUserId = getCurrentUserId();
      const [gdRes, dmRes, viRes] = await Promise.all([
        api.get(`/giao-dich/nguoi-dung/${currentUserId}`),
        api.get(`/danh-muc/nguoi-dung/${currentUserId}`),
        api.get(`/vi-tien/nguoi-dung/${currentUserId}`),
      ]);

      setAllGiaoDich(Array.isArray(gdRes.data) ? gdRes.data : []);
      setCategories(Array.isArray(dmRes.data) ? dmRes.data : []);
      setWallets(Array.isArray(viRes.data) ? viRes.data : []);
    } catch (e) {
      console.error("Lỗi khi tải dữ liệu:", e);
      setError("Không thể kết nối đến Backend. Hãy kiểm tra server đang chạy.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ──── 3) Lọc client-side (Advanced Search) ──── */
  const filtered = useMemo(() => {
    let list = [...allGiaoDich];

    if (debouncedKw.trim()) {
      const kw = debouncedKw.toLowerCase().trim();
      list = list.filter(
        (gd) =>
          (gd.moTa && gd.moTa.toLowerCase().includes(kw)) ||
          (gd.danhMuc?.tenDanhMuc && gd.danhMuc.tenDanhMuc.toLowerCase().includes(kw))
      );
    }

    if (loai !== "all") {
      list = list.filter((gd) => gd.loai === loai);
    }

    if (danhMucId !== "all") {
      list = list.filter((gd) => gd.danhMuc?.id === Number(danhMucId));
    }

    if (tuNgay) {
      const from = new Date(tuNgay + "T00:00:00");
      list = list.filter((gd) => new Date(gd.ngayGiaoDich) >= from);
    }
    if (denNgay) {
      const to = new Date(denNgay + "T23:59:59");
      list = list.filter((gd) => new Date(gd.ngayGiaoDich) <= to);
    }

    list.sort(
      (a, b) =>
        new Date(b.ngayGiaoDich).getTime() - new Date(a.ngayGiaoDich).getTime()
    );

    return list;
  }, [allGiaoDich, debouncedKw, loai, danhMucId, tuNgay, denNgay]);

  /* ──── 4) Phân trang client-side ──── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const changeFilter = (setter: (v: string) => void, value: string) => {
    setter(value);
    setPage(0);
  };

  const resetFilters = () => {
    setKeyword("");
    setLoai("all");
    setDanhMucId("all");
    setTuNgay("");
    setDenNgay("");
    setPage(0);
  };

  /* ──── 5) AI Suggest Category ──── */
  const [aiError, setAiError] = useState<string | null>(null);

  const handleAiSuggest = async () => {
    if (!newGD.moTa.trim()) {
      setAiError("Vui lòng nhập mô tả giao dịch trước khi gợi ý AI");
      return;
    }
    setAiLoading(true);
    setAiSuggestion(null);
    setAiError(null);
    try {
      const res = await autoCategorizeApi.suggestCategory({
        moTa: newGD.moTa,
        loai: newGD.loai,
      });
      if (res.status === 200 && res.data) {
        setAiSuggestion(res.data);
        // Auto-select danh mục
        if (res.data.danhMucId) {
          setNewGD((prev) => ({ ...prev, danhMucId: String(res.data.danhMucId) }));
        }
      } else {
        // 204 No Content — AI không tìm được danh mục phù hợp
        setAiError("AI không thể phân loại. Hãy kiểm tra bạn đã tạo danh mục chưa (vào trang Danh mục).");
      }
    } catch (e: any) {
      console.error("AI suggest error:", e);
      const msg = e.response?.data?.message || e.message || "Lỗi kết nối";
      setAiError(`AI gợi ý thất bại: ${msg}`);
    } finally {
      setAiLoading(false);
    }
  };

  /* ──── 6) Create Transaction ──── */
  const handleCreateTransaction = async () => {
    setCreateError(null);
    if (!newGD.moTa.trim()) {
      setCreateError("Vui lòng nhập mô tả giao dịch");
      return;
    }
    if (!newGD.soTien || Number(newGD.soTien) <= 0) {
      setCreateError("Vui lòng nhập số tiền hợp lệ");
      return;
    }
    const viId = newGD.viId || (wallets.length > 0 ? wallets[0].id : "");
    if (!viId) {
      setCreateError("Bạn chưa có ví nào. Hãy tạo ví trước.");
      return;
    }

    setCreateLoading(true);
    try {
      const body = {
        soTien: Number(newGD.soTien),
        loai: newGD.loai,
        moTa: newGD.moTa,
        ngayGiaoDich: newGD.ngayGiaoDich,
      };

      if (newGD.danhMucId) {
        // Tạo giao dịch thông thường (user đã chọn danh mục)
        const uid = getCurrentUserId();
        await api.post(
          `/giao-dich?nguoiDungId=${uid}&viId=${viId}&danhMucId=${newGD.danhMucId}`,
          body
        );
      } else {
        // Tạo giao dịch với auto-categorize (AI chọn danh mục)
        await autoCategorizeApi.createWithAutoCategory(viId, body);
      }

      // Reset form & refresh data
      setShowCreateModal(false);
      setNewGD({
        moTa: "",
        soTien: "",
        loai: "expense",
        ngayGiaoDich: new Date().toISOString().slice(0, 16),
        viId: "",
        danhMucId: "",
      });
      setAiSuggestion(null);
      await fetchData();
    } catch (e: any) {
      console.error("Create error:", e);
      setCreateError(e.response?.data?.message || "Không thể tạo giao dịch. Vui lòng thử lại.");
    } finally {
      setCreateLoading(false);
    }
  };

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Giao dịch</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tra cứu, lọc và quản lý toàn bộ giao dịch thu chi của bạn
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700
                     text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Thêm giao dịch
        </button>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <Card className="shadow-sm overflow-visible">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-slate-700 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-violet-500" />
              Bộ lọc nâng cao
            </CardTitle>
            <div className="flex items-center gap-3">
              {filtered.length !== allGiaoDich.length && (
                <span className="text-xs text-violet-600 font-medium">
                  {filtered.length}/{allGiaoDich.length} kết quả
                </span>
              )}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                {showAdvanced ? "Thu gọn ↑" : "Mở rộng ↓"}
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Row 1: Keyword + Loại + Danh mục + Reset */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            {/* Keyword (Debounced) + Recent Search History */}
            <div className="lg:col-span-5" ref={searchRef}>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm theo mô tả, tên danh mục..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                             outline-none transition-all placeholder:text-slate-400"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onFocus={() => {
                    if (searchHistory.length > 0) setShowHistory(true);
                  }}
                />
                {keyword !== debouncedKw && (
                  <Loader2 className="w-4 h-4 text-violet-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}

                {/* ── Recent Search History Dropdown ── */}
                {showHistory && searchHistory.length > 0 && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200
                                  rounded-xl shadow-lg shadow-slate-200/50 overflow-hidden animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Tìm kiếm gần đây
                      </span>
                      <button
                        onClick={handleClearAllHistory}
                        className="text-[11px] text-rose-400 hover:text-rose-600 font-medium transition-colors"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {searchHistory.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-violet-50/60
                                     cursor-pointer transition-colors group"
                        >
                          <button
                            className="flex items-center gap-2 flex-1 text-left text-sm text-slate-600
                                       group-hover:text-violet-700 truncate"
                            onClick={() => handleSelectHistory(item.tuKhoa)}
                          >
                            <Search className="w-3.5 h-3.5 text-slate-300 group-hover:text-violet-400 shrink-0" />
                            <span className="truncate">{item.tuKhoa}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(item.id);
                            }}
                            className="p-1 rounded-md text-slate-300 hover:text-rose-500 hover:bg-rose-50
                                       opacity-0 group-hover:opacity-100 transition-all shrink-0"
                            title="Xóa"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Loại */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Phân loại
              </label>
              <div className="relative">
                <ArrowUpDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             appearance-none outline-none cursor-pointer
                             focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  value={loai}
                  onChange={(e) => changeFilter(setLoai, e.target.value)}
                >
                  <option value="all">Tất cả</option>
                  <option value="income">Thu nhập</option>
                  <option value="expense">Chi tiêu</option>
                </select>
              </div>
            </div>

            {/* Danh mục */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Danh mục
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             appearance-none outline-none cursor-pointer
                             focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  value={danhMucId}
                  onChange={(e) => changeFilter(setDanhMucId, e.target.value)}
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tenDanhMuc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nút bỏ lọc */}
            <div className="lg:col-span-2 flex items-end">
              <button
                onClick={resetFilters}
                className="w-full h-[42px] flex items-center justify-center gap-2
                           bg-slate-100 hover:bg-slate-200 text-slate-600
                           text-sm font-medium rounded-lg transition-colors border border-slate-200"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                Bỏ lọc
              </button>
            </div>
          </div>

          {/* Row 2: Ngày tháng (ẩn/hiện) */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Từ ngày
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                               outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    value={tuNgay}
                    onChange={(e) => changeFilter(setTuNgay, e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Đến ngày
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                               outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                    value={denNgay}
                    onChange={(e) => changeFilter(setDenNgay, e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ KẾT QUẢ ═══ */}
      <Card className="shadow-sm overflow-hidden">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-2">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
            <p className="text-sm text-slate-500">Đang tải dữ liệu giao dịch...</p>
          </div>
        )}

        {/* Lỗi */}
        {!loading && error && (
          <div className="p-12 text-center">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
            <p className="text-rose-500 font-medium mb-1">{error}</p>
            <p className="text-xs text-slate-400 mb-4">
              Kiểm tra Backend đang chạy tại http://localhost:8080
            </p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-violet-600 hover:underline font-medium"
            >
              Tải lại trang
            </button>
          </div>
        )}

        {/* Rỗng */}
        {!loading && !error && paged.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            <div className="mx-auto w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300" />
            </div>
            <p className="font-medium">
              {allGiaoDich.length === 0
                ? "Chưa có giao dịch nào"
                : "Không tìm thấy giao dịch phù hợp"}
            </p>
            <p className="text-xs mt-1 text-slate-400">
              {allGiaoDich.length === 0
                ? "Tạo giao dịch mới để bắt đầu theo dõi thu chi"
                : "Hãy thử thay đổi bộ lọc hoặc từ khoá"}
            </p>
          </div>
        )}

        {/* Có dữ liệu */}
        {!loading && !error && paged.length > 0 && (
          <>
            {/* Summary bar */}
            <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Hiển thị {page * PAGE_SIZE + 1}–
                {Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length} giao dịch
              </span>
            </div>

            {/* Bảng */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-12" />
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="text-left px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="text-right px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Số tiền
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((gd) => {
                    const inc = gd.loai === "income";
                    return (
                      <tr
                        key={gd.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* icon */}
                        <td className="px-6 py-3.5">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center
                              ${inc ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}
                          >
                            {inc ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                        </td>

                        {/* mô tả + ví */}
                        <td className="px-6 py-3.5">
                          <p className="font-medium text-slate-800 truncate max-w-[250px]">
                            {gd.moTa || "—"}
                          </p>
                          {gd.viTien && (
                            <p className="text-xs text-slate-400 mt-0.5">
                              {gd.viTien.tenVi}
                            </p>
                          )}
                        </td>

                        {/* danh mục + AI badge */}
                        <td className="px-6 py-3.5">
                          {gd.danhMuc ? (
                            <div className="flex items-center gap-1.5">
                              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700">
                                {gd.danhMuc.tenDanhMuc}
                              </span>
                              {gd.aiCategorized && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                                  <Bot className="w-3 h-3" />
                                  AI
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic text-xs">
                              Không phân loại
                            </span>
                          )}
                        </td>

                        {/* ngày */}
                        <td className="px-6 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                          {fmtDate(gd.ngayGiaoDich)}
                        </td>

                        {/* số tiền */}
                        <td
                          className={`px-6 py-3.5 text-right font-semibold whitespace-nowrap
                            ${inc ? "text-emerald-600" : "text-rose-600"}`}
                        >
                          {inc ? "+" : "−"}
                          {fmtVND(gd.soTien)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Trang {page + 1} / {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500
                               hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page + 1 >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-500
                               hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* ═══════════════════════════════════════════
          MODAL: Thêm giao dịch mới (với AI Suggest)
          ═══════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-violet-500" />
                Thêm giao dịch mới
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
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
                  placeholder="VD: Grab taxi đi làm, Ăn phở sáng..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             focus:bg-white focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400
                             outline-none transition-all placeholder:text-slate-400"
                  value={newGD.moTa}
                  onChange={(e) => setNewGD({ ...newGD, moTa: e.target.value })}
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
                             outline-none transition-all placeholder:text-slate-400"
                  value={newGD.soTien}
                  onChange={(e) => setNewGD({ ...newGD, soTien: e.target.value })}
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
                    onClick={() => setNewGD({ ...newGD, loai: "expense", danhMucId: "" })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${newGD.loai === "expense"
                        ? "bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20"
                        : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                      }`}
                  >
                    ↗ Chi tiêu
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewGD({ ...newGD, loai: "income", danhMucId: "" })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-all
                      ${newGD.loai === "income"
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
                  value={newGD.ngayGiaoDich}
                  onChange={(e) => setNewGD({ ...newGD, ngayGiaoDich: e.target.value })}
                />
              </div>

              {/* Ví */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ví
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm
                             appearance-none outline-none cursor-pointer
                             focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
                  value={newGD.viId || (wallets.length > 0 ? wallets[0].id : "")}
                  onChange={(e) => setNewGD({ ...newGD, viId: e.target.value })}
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
                    value={newGD.danhMucId}
                    onChange={(e) => {
                      setNewGD({ ...newGD, danhMucId: e.target.value });
                      setAiSuggestion(null);
                    }}
                  >
                    <option value="">— Để AI phân loại —</option>
                    {categories
                      .filter((c) => {
                        if (newGD.loai === "expense") return c.loai === "chi";
                        if (newGD.loai === "income") return c.loai === "thu";
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
                    disabled={aiLoading || !newGD.moTa.trim()}
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

                {/* AI Error */}
                {aiError && (
                  <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {aiError}
                  </div>
                )}
              </div>

              {/* Error */}
              {createError && (
                <div className="flex items-center gap-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {createError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100
                           rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTransaction}
                disabled={createLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700
                           text-white text-sm font-medium rounded-lg transition-colors shadow-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                💾 Lưu giao dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
