import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

/* ═══════ TYPES ═══════ */
interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  loai?: string;
}

interface GiaoDich {
  id: string;
  soTien: number;
  loai: string;
  moTa: string;
  ngayGiaoDich: string;
  ngayTao: string;
  danhMuc?: DanhMuc;
  viTien?: { id: string; tenVi: string };
}

import { getCurrentUserId } from "../services/api";

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

  /* --- pagination state --- */
  const [page, setPage] = useState(0);

  /* ──── 1) Debounce keyword 500ms ──── */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedKw(keyword);
      setPage(0);
    }, 500);
    return () => clearTimeout(t);
  }, [keyword]);

  /* ──── 2) Fetch data từ Backend (1 lần) ──── */
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Song song fetch giao dịch + danh mục
        const currentUserId = getCurrentUserId();
        const [gdRes, dmRes] = await Promise.all([
          fetch(`/api/giao-dich/nguoi-dung/${currentUserId}`),
          fetch(`/api/danh-muc/nguoi-dung/${currentUserId}`),
        ]);

        // Xử lý giao dịch
        if (gdRes.ok) {
          const gdData = await gdRes.json();
          setAllGiaoDich(Array.isArray(gdData) ? gdData : []);
        } else {
          setAllGiaoDich([]);
        }

        // Xử lý danh mục
        if (dmRes.ok) {
          const dmData = await dmRes.json();
          setCategories(Array.isArray(dmData) ? dmData : []);
        } else {
          setCategories([]);
        }
      } catch (e) {
        console.error("Lỗi khi tải dữ liệu:", e);
        setError("Không thể kết nối đến Backend. Hãy kiểm tra server đang chạy.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ──── 3) Lọc client-side (Advanced Search) ──── */
  const filtered = useMemo(() => {
    let list = [...allGiaoDich];

    // Lọc theo từ khóa (debounced): tìm trong moTa, tenDanhMuc
    if (debouncedKw.trim()) {
      const kw = debouncedKw.toLowerCase().trim();
      list = list.filter(
        (gd) =>
          (gd.moTa && gd.moTa.toLowerCase().includes(kw)) ||
          (gd.danhMuc?.tenDanhMuc && gd.danhMuc.tenDanhMuc.toLowerCase().includes(kw))
      );
    }

    // Lọc theo loại (income / expense)
    if (loai !== "all") {
      list = list.filter((gd) => gd.loai === loai);
    }

    // Lọc theo danh mục
    if (danhMucId !== "all") {
      list = list.filter((gd) => gd.danhMuc?.id === Number(danhMucId));
    }

    // Lọc theo khoảng ngày
    if (tuNgay) {
      const from = new Date(tuNgay + "T00:00:00");
      list = list.filter((gd) => new Date(gd.ngayGiaoDich) >= from);
    }
    if (denNgay) {
      const to = new Date(denNgay + "T23:59:59");
      list = list.filter((gd) => new Date(gd.ngayGiaoDich) <= to);
    }

    // Sắp xếp mới nhất trước
    list.sort(
      (a, b) =>
        new Date(b.ngayGiaoDich).getTime() - new Date(a.ngayGiaoDich).getTime()
    );

    return list;
  }, [allGiaoDich, debouncedKw, loai, danhMucId, tuNgay, denNgay]);

  /* ──── 4) Phân trang client-side ──── */
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  /* Reset page khi bộ lọc thay đổi */
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

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Giao dịch</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tra cứu, lọc và quản lý toàn bộ giao dịch thu chi của bạn
        </p>
      </div>

      {/* ═══ FILTER BAR ═══ */}
      <Card className="shadow-sm">
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
            {/* Keyword (Debounced) */}
            <div className="lg:col-span-5">
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
                />
                {keyword !== debouncedKw && (
                  <Loader2 className="w-4 h-4 text-violet-500 animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
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

                        {/* danh mục */}
                        <td className="px-6 py-3.5">
                          {gd.danhMuc ? (
                            <span className="inline-block px-2.5 py-1 rounded-md text-xs font-medium bg-violet-50 text-violet-700">
                              {gd.danhMuc.tenDanhMuc}
                            </span>
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
    </div>
  );
}
