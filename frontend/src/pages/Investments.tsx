import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  X,
  RefreshCw,
  History,
  Wallet,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// --- Types ---
interface TaiSanCrypto {
  id: number;
  kyHieu: string;
  ten: string;
}

interface DanhMucCrypto {
  id: string;
  taiSan: TaiSanCrypto;
  soLuong: number;
  giaMuaTrungBinh: number;
  diaChiVi: string;
}

interface GiaoDichCrypto {
  id: string;
  loai: "buy" | "sell";
  soLuong: number;
  gia: number;
  ngayGiaoDich: string;
}

const API_BASE = "http://localhost:8080/api";

import { getCurrentUserId } from "@/services/api";

const CRYPTO_COLORS: Record<string, string> = {
  BTC: "from-orange-400 to-amber-500",
  ETH: "from-indigo-400 to-purple-500",
  BNB: "from-yellow-400 to-amber-400",
  SOL: "from-violet-400 to-purple-500",
  ADA: "from-blue-400 to-indigo-500",
  XRP: "from-sky-400 to-blue-500",
  DOGE: "from-yellow-300 to-orange-400",
  DOT: "from-pink-400 to-rose-500",
  MATIC: "from-purple-400 to-violet-500",
  AVAX: "from-red-400 to-rose-500",
};

const getCryptoGradient = (kyHieu: string) =>
  CRYPTO_COLORS[kyHieu?.toUpperCase()] ?? "from-slate-400 to-slate-600";

const formatNumber = (n: number, decimals = 2) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const formatVnCurrencyInput = (val: string) => {
  const numericVal = val.replace(/[^0-9]/g, "");
  if (!numericVal) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(numericVal, 10));
};

const parseVnCurrency = (val: string) => {
  return parseFloat(val.replace(/\./g, "")) || 0;
};

export default function Investments() {
  const [portfolio, setPortfolio] = useState<DanhMucCrypto[]>([]);
  const [availableAssets, setAvailableAssets] = useState<TaiSanCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal: Add coin to portfolio
  const [isAddCoinOpen, setIsAddCoinOpen] = useState(false);
  const [addCoinForm, setAddCoinForm] = useState({
    taiSanId: "",
    soLuong: "",
    giaMuaTrungBinh: "",
    diaChiVi: "",
  });

  // Modal: Transaction history & add transaction
  const [selectedCoin, setSelectedCoin] = useState<DanhMucCrypto | null>(null);
  const [transactions, setTransactions] = useState<GiaoDichCrypto[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txForm, setTxForm] = useState({
    loai: "buy" as "buy" | "sell",
    soLuong: "",
    gia: "",
    ngayGiaoDich: new Date().toISOString().slice(0, 16),
  });

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portfolioRes, assetsRes] = await Promise.all([
        fetch(`${API_BASE}/crypto/danh-muc/nguoi-dung/${getCurrentUserId()}`),
        fetch(`${API_BASE}/tai-san-crypto`),
      ]);
      if (!portfolioRes.ok) throw new Error("Không thể tải danh mục crypto.");
      if (!assetsRes.ok) throw new Error("Không thể tải danh sách tài sản.");
      const portfolioData = await portfolioRes.json();
      const assetsData = await assetsRes.json();
      setPortfolio(portfolioData);
      setAvailableAssets(assetsData);
      if (assetsData.length > 0 && !addCoinForm.taiSanId) {
        setAddCoinForm((p) => ({ ...p, taiSanId: assetsData[0].id.toString() }));
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [addCoinForm.taiSanId]);

  useEffect(() => {
    fetchPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // ========================
  //  AUTO-FETCH LIVE PRICE
  // ========================
  const fetchLivePrice = async (kyHieu: string): Promise<number> => {
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${kyHieu.toUpperCase()}USDT`);
      if (!res.ok) return 0;
      const data = await res.json();
      const usdPrice = parseFloat(data.price);
      return Math.round(usdPrice * 25400); // Tỷ giá tham khảo 1 USD = 25,400 VNĐ
    } catch {
      return 0; // Fallback nếu lỗi (mất mạng, coin không có trên sàn Binance)
    }
  };

  // Tự động điền giá khi chọn coin ở Modal Thêm Mới
  useEffect(() => {
    if (!addCoinForm.taiSanId || !isAddCoinOpen) return;
    const coin = availableAssets.find(c => c.id.toString() === addCoinForm.taiSanId);
    if (!coin) return;

    fetchLivePrice(coin.kyHieu).then(price => {
      if (price > 0) {
        setAddCoinForm(prev => ({ ...prev, giaMuaTrungBinh: formatVnCurrencyInput(price.toString()) }));
      }
    });
  }, [addCoinForm.taiSanId, isAddCoinOpen, availableAssets]);

  // Tự động điền giá hiện tại khi mở Modal Ghi Lệnh
  useEffect(() => {
    if (!selectedCoin || !isTxModalOpen) return;
    fetchLivePrice(selectedCoin.taiSan.kyHieu).then(price => {
      if (price > 0) {
        setTxForm(prev => ({ ...prev, gia: formatVnCurrencyInput(price.toString()) }));
      }
    });
  }, [selectedCoin, isTxModalOpen]);

  // ========================
  //  ADD COIN TO PORTFOLIO
  // ========================
  const handleAddCoin = async () => {
    if (!addCoinForm.taiSanId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/crypto/danh-muc?nguoiDungId=${getCurrentUserId()}&taiSanId=${addCoinForm.taiSanId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            soLuong: parseFloat(addCoinForm.soLuong) || 0,
            giaMuaTrungBinh: parseVnCurrency(addCoinForm.giaMuaTrungBinh),
            diaChiVi: addCoinForm.diaChiVi || "",
          }),
        }
      );
      if (!res.ok) throw new Error("Không thể thêm coin.");
      showSuccess("Đã thêm coin vào danh mục!");
      setIsAddCoinOpen(false);
      setAddCoinForm({ taiSanId: availableAssets[0]?.id.toString() || "", soLuong: "", giaMuaTrungBinh: "", diaChiVi: "" });
      fetchPortfolio();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoin = async (id: string) => {
    if (!confirm("Xóa coin này khỏi danh mục? Toàn bộ lịch sử giao dịch sẽ bị xóa.")) return;
    try {
      const res = await fetch(`${API_BASE}/crypto/danh-muc/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể xóa.");
      showSuccess("Đã xóa coin.");
      fetchPortfolio();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // ========================
  //  TRANSACTION MODAL
  // ========================
  const openTxModal = async (coin: DanhMucCrypto) => {
    setSelectedCoin(coin);
    setIsTxModalOpen(true);
    setTxLoading(true);
    try {
      const res = await fetch(`${API_BASE}/crypto/giao-dich/danh-muc/${coin.id}`);
      if (!res.ok) throw new Error("Không thể tải giao dịch.");
      setTransactions(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTxLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!selectedCoin || !txForm.soLuong || !txForm.gia) return;
    setTxLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/crypto/giao-dich?danhMucId=${selectedCoin.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loai: txForm.loai,
            soLuong: parseFloat(txForm.soLuong),
            gia: parseVnCurrency(txForm.gia),
            ngayGiaoDich: txForm.ngayGiaoDich + ":00",
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Không thể ghi giao dịch.");
      }
      showSuccess(`Đã ghi nhận lệnh ${txForm.loai === "buy" ? "Mua" : "Bán"}!`);
      setTxForm({ loai: "buy", soLuong: "", gia: "", ngayGiaoDich: new Date().toISOString().slice(0, 16) });
      // Reload transactions and portfolio
      const [txRes] = await Promise.all([
        fetch(`${API_BASE}/crypto/giao-dich/danh-muc/${selectedCoin.id}`),
      ]);
      setTransactions(await txRes.json());
      fetchPortfolio();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setTxLoading(false);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("Xóa giao dịch này?")) return;
    try {
      await fetch(`${API_BASE}/crypto/giao-dich/${txId}`, { method: "DELETE" });
      showSuccess("Đã xóa giao dịch.");
      if (selectedCoin) {
        const res = await fetch(`${API_BASE}/crypto/giao-dich/danh-muc/${selectedCoin.id}`);
        setTransactions(await res.json());
      }
      fetchPortfolio();
    } catch (e: any) {
      setError(e.message);
    }
  };

  // ========================
  //  Stats
  // ========================
  const tongVonDauTu = portfolio.reduce(
    (s, c) => s + (c.soLuong || 0) * (c.giaMuaTrungBinh || 0),
    0
  );
  const tongCoin = portfolio.length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8">

      {/* Toast */}
      {(success || error) && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all animate-in slide-in-from-right
          ${success ? "bg-emerald-500" : "bg-rose-500"}`}>
          {success || error}
          <button onClick={() => { setSuccess(null); setError(null); }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #f59e0b 0%, #d97706 40%, #b45309 100%)" }}>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Coins className="w-5 h-5 text-white" />
              </div>
              <span className="text-amber-200 font-bold text-sm uppercase tracking-widest">Crypto Portfolio</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Tài sản Crypto</h1>
            <p className="text-amber-100/80 font-medium text-sm max-w-md">
              Theo dõi, mua và bán tài sản số của bạn tại một nơi.
            </p>
          </div>
          <Button
            onClick={() => setIsAddCoinOpen(true)}
            className="bg-white text-amber-600 hover:bg-amber-50 px-8 h-12 rounded-xl font-bold text-sm shadow-lg gap-2 shrink-0"
          >
            <Plus className="w-5 h-5" /> Thêm Coin
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Tổng vốn đầu tư", value: formatCurrency(tongVonDauTu), icon: <Wallet className="w-5 h-5" />, color: "amber" },
          { label: "Số loại coin", value: `${tongCoin} coin`, icon: <BarChart3 className="w-5 h-5" />, color: "indigo" },
          { label: "Trạng thái", value: loading ? "Đang tải..." : "Cập nhật", icon: <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />, color: "emerald" },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center 
                ${i === 0 ? "bg-amber-50 text-amber-500" : i === 1 ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-800">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Danh mục đang nắm giữ</h2>

        {loading && portfolio.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <RefreshCw className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-spin" />
            <p className="text-slate-400 font-medium">Đang tải danh mục...</p>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="py-24 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <Coins className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-bold text-lg mb-1">Danh mục trống</p>
            <p className="text-slate-400 text-sm">Nhấn "Thêm Coin" để bắt đầu theo dõi tài sản crypto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((coin) => {
              const gradient = getCryptoGradient(coin.taiSan?.kyHieu);
              const tongGiaTri = (coin.soLuong || 0) * (coin.giaMuaTrungBinh || 0);
              return (
                <Card
                  key={coin.id}
                  className="border-none shadow-sm hover:shadow-xl transition-all rounded-[2rem] bg-white group overflow-hidden cursor-pointer"
                  onClick={() => openTxModal(coin)}
                >
                  {/* Coin color band */}
                  <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                          <span className="text-white font-black text-lg">{coin.taiSan?.kyHieu?.slice(0, 3)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg font-black text-slate-800">{coin.taiSan?.kyHieu}</CardTitle>
                          <p className="text-xs font-medium text-slate-400">{coin.taiSan?.ten}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button
                          variant="ghost" size="icon"
                          onClick={(e) => { e.stopPropagation(); handleDeleteCoin(coin.id); }}
                          className="h-8 w-8 text-slate-400 hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-amber-500">
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số lượng</p>
                        <p className="font-black text-slate-800 text-base">{formatNumber(coin.soLuong || 0, 6)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá TB mua</p>
                        <p className="font-black text-slate-800 text-base">{formatNumber(coin.giaMuaTrungBinh || 0, 0)}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tổng giá trị vốn</p>
                        <p className="font-black text-slate-700">{formatCurrency(tongGiaTri)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl">
                        <History className="w-3.5 h-3.5" />
                        Lịch sử
                      </div>
                    </div>
                    {coin.diaChiVi && (
                      <div className="bg-slate-50 rounded-xl px-3 py-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ ví</p>
                        <p className="font-mono text-[10px] text-slate-500 truncate">{coin.diaChiVi}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================
          MODAL: Add Coin to Portfolio
          ============================ */}
      {isAddCoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddCoinOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-white flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}>
              <h2 className="text-xl font-black tracking-tight">Thêm Coin vào Danh mục</h2>
              <button onClick={() => setIsAddCoinOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Chọn Coin</label>
                <select
                  value={addCoinForm.taiSanId}
                  onChange={(e) => setAddCoinForm({ ...addCoinForm, taiSanId: e.target.value })}
                  className="w-full h-11 pl-4 pr-8 rounded-xl bg-slate-50 border-none font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-100 appearance-none"
                >
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>{a.kyHieu} – {a.ten}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Số lượng ban đầu</label>
                  <Input
                    type="number" step="any"
                    placeholder="0"
                    value={addCoinForm.soLuong}
                    onChange={(e) => setAddCoinForm({ ...addCoinForm, soLuong: e.target.value })}
                    className="h-11 rounded-xl bg-slate-50 border-none font-bold text-slate-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Giá mua TB (VNĐ)</label>
                  <Input
                    type="text"
                    placeholder="0"
                    value={addCoinForm.giaMuaTrungBinh}
                    onChange={(e) => setAddCoinForm({ ...addCoinForm, giaMuaTrungBinh: formatVnCurrencyInput(e.target.value) })}
                    className="h-11 rounded-xl bg-slate-50 border-none font-bold text-slate-800"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Địa chỉ ví (tùy chọn)</label>
                <Input
                  placeholder="0x..."
                  value={addCoinForm.diaChiVi}
                  onChange={(e) => setAddCoinForm({ ...addCoinForm, diaChiVi: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50 border-none font-mono text-sm text-slate-600"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3">
              <Button variant="ghost" onClick={() => setIsAddCoinOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-sm text-slate-400 hover:bg-slate-100">
                Hủy
              </Button>
              <Button
                onClick={handleAddCoin}
                disabled={loading || !addCoinForm.taiSanId}
                className="flex-1 h-12 text-white font-bold text-sm rounded-xl shadow-lg px-8"
                style={{ background: "linear-gradient(135deg, #f59e0b, #b45309)" }}
              >
                {loading ? "..." : "Xác nhận"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================
          MODAL: Transaction History
          ============================ */}
      {isTxModalOpen && selectedCoin && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsTxModalOpen(false)} />
          <div className="relative bg-white w-full sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className={`p-6 text-white flex items-center justify-between shrink-0 bg-gradient-to-r ${getCryptoGradient(selectedCoin.taiSan?.kyHieu)}`}>
              <div>
                <h2 className="text-xl font-black tracking-tight">
                  {selectedCoin.taiSan?.kyHieu} – Lịch sử Giao dịch
                </h2>
                <p className="text-white/70 text-xs font-semibold mt-0.5">
                  Đang nắm: {formatNumber(selectedCoin.soLuong || 0, 6)} • Giá TB: {formatNumber(selectedCoin.giaMuaTrungBinh || 0, 0)} VNĐ
                </p>
              </div>
              <button onClick={() => setIsTxModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Add Transaction Form */}
              <div className="p-6 border-b border-slate-100 space-y-4 bg-slate-50/50">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Ghi nhận Giao dịch mới</p>
                <div className="grid grid-cols-2 gap-3">
                  {(["buy", "sell"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTxForm({ ...txForm, loai: t })}
                      className={`h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border-2 transition-all
                        ${txForm.loai === t
                          ? t === "buy"
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                            : "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100"
                          : "bg-white border-slate-100 text-slate-400 hover:border-slate-200"
                        }`}
                    >
                      {t === "buy" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {t === "buy" ? "Mua" : "Bán"}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Số lượng</label>
                    <Input type="number" step="any" placeholder="0.00"
                      value={txForm.soLuong}
                      onChange={(e) => setTxForm({ ...txForm, soLuong: e.target.value })}
                      className="h-11 rounded-xl bg-white border-slate-100 font-bold text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Giá (VNĐ)</label>
                    <Input type="text" placeholder="0"
                      value={txForm.gia}
                      onChange={(e) => setTxForm({ ...txForm, gia: formatVnCurrencyInput(e.target.value) })}
                      className="h-11 rounded-xl bg-white border-slate-100 font-bold text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Thời gian</label>
                  <Input type="datetime-local"
                    value={txForm.ngayGiaoDich}
                    onChange={(e) => setTxForm({ ...txForm, ngayGiaoDich: e.target.value })}
                    className="h-11 rounded-xl bg-white border-slate-100 font-bold text-slate-700"
                  />
                </div>
                <Button
                  onClick={handleAddTransaction}
                  disabled={txLoading || !txForm.soLuong || !txForm.gia}
                  className={`w-full h-12 rounded-xl font-bold text-sm text-white shadow-lg
                    ${txForm.loai === "buy"
                      ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-100"
                      : "bg-rose-500 hover:bg-rose-600 shadow-rose-100"
                    }`}
                >
                  {txLoading ? "..." : txForm.loai === "buy" ? "✓ Ghi nhận Lệnh MUA" : "✓ Ghi nhận Lệnh BÁN"}
                </Button>
              </div>

              {/* Transaction List */}
              <div className="p-6 space-y-3">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Lịch sử ({transactions.length})</p>
                {txLoading ? (
                  <div className="py-10 text-center">
                    <RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="py-10 text-center">
                    <History className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">Chưa có giao dịch nào.</p>
                  </div>
                ) : (
                  [...transactions]
                    .sort((a, b) => new Date(b.ngayGiaoDich).getTime() - new Date(a.ngayGiaoDich).getTime())
                    .map((tx) => (
                      <div key={tx.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                            ${tx.loai === "buy" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
                            {tx.loai === "buy" ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">
                              {tx.loai === "buy" ? "Mua" : "Bán"} {formatNumber(tx.soLuong, 6)} {selectedCoin.taiSan?.kyHieu}
                            </p>
                            <p className="text-xs text-slate-400 font-medium">
                              @ {formatNumber(tx.gia, 0)} VNĐ • {new Date(tx.ngayGiaoDich).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <p className={`font-black text-sm ${tx.loai === "buy" ? "text-emerald-600" : "text-rose-600"}`}>
                            {tx.loai === "buy" ? "+" : "-"}{formatCurrency(tx.soLuong * tx.gia)}
                          </p>
                          <Button
                            variant="ghost" size="icon"
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="h-8 w-8 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
