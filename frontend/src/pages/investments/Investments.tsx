import { useState, useEffect, useCallback, useMemo } from "react";
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
  viId?: string;
}


import { cryptoApi, viTienApi } from "@/services/api";

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
  
const USD_VND_RATE = 25400; // Tỷ giá mặc định

const formatNumber = (n: number, maxDecimals = 6) =>
  new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(n);

const formatCurrency = (n: number, currency = "VND") => {
  const locale = currency === "USD" ? "en-US" : "vi-VN";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(n);
};

const formatPriceInput = (val: string | number, currency = "VND") => {
  if (val === undefined || val === null || val === "") return "";
  
  if (currency === "USD") {
    // 1. Trường hợp là SỐ (Giá từ API về)
    if (typeof val === 'number') {
      return new Intl.NumberFormat("vi-VN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 8
      }).format(val);
    }

    // 2. Trường hợp là CHUỖI (Đang nhập liệu)
    // - Xóa các ký tự không phải số và dấu phẩy (làm decimal)
    // - Lưu ý: Ở VN-style, ta dùng dấu phẩy làm thập phân.
    let sVal = val.toString();
    
    // Nếu người dùng gõ dấu chấm (.) chúng ta coi như họ muốn gõ phân cách hàng ngàn (ignore) hoặc gõ nhầm thập phân
    // Để đơn giản, ta chuẩn hóa: xóa hết dấu chấm, giữ lại dấu phẩy
    let cleanVal = sVal.replace(/\./g, "");
    const parts = cleanVal.split(",");
    
    let whole = parts[0].replace(/[^0-9]/g, "") || "0";
    let decimal = parts.length > 1 ? parts[1].replace(/[^0-9]/g, "") : null;
    
    // Định dạng phần nguyên
    const formattedWhole = new Intl.NumberFormat("vi-VN").format(parseInt(whole, 10) || 0);
    
    return decimal !== null ? `${formattedWhole},${decimal}` : formattedWhole;
  }

  // Với VND: Giữ nguyên (dùng dấu chấm làm phân cách hàng ngàn, không lẻ)
  if (typeof val === 'number') {
    return new Intl.NumberFormat("vi-VN").format(Math.round(val));
  }
  let sVal = val.toString().replace(/\./g, "");
  const numericVal = sVal.replace(/[^0-9]/g, "");
  if (!numericVal) return "";
  return new Intl.NumberFormat("vi-VN").format(parseInt(numericVal, 10));
};

const parsePriceInput = (val: string, currency = "VND") => {
  if (currency === "USD") {
    // Xóa dấu chấm (hàng ngàn), đổi dấu phẩy (thập phân) thành dấu chấm để parseFloat
    const machineVal = val.replace(/\./g, "").replace(/,/g, ".");
    return parseFloat(machineVal) || 0;
  }
  return parseFloat(val.toString().replace(/\./g, "")) || 0;
};

export default function Investments() {
  const [portfolio, setPortfolio] = useState<DanhMucCrypto[]>([]);
  const [availableAssets, setAvailableAssets] = useState<TaiSanCrypto[]>([]);
  const [userWallets, setUserWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [marketPrices, setMarketPrices] = useState<Record<string, { usd: number, vnd: number }>>({});

  // Modal: Add coin to portfolio
  const [isAddCoinOpen, setIsAddCoinOpen] = useState(false);
  const [addCoinForm, setAddCoinForm] = useState({
    taiSanId: "",
    soLuong: "",
    giaMuaTrungBinh: "",
    diaChiVi: "",
    viId: "",
    tienTe: "VND", // Thêm loại tiền tệ nhập liệu
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
    viId: "",
    tienTe: "VND", // Thêm loại tiền tệ nhập liệu
  });

  const fetchMarketPrices = useCallback(async (coins: DanhMucCrypto[]) => {
    if (coins.length === 0) return;
    setPricesLoading(true);
    try {
      const symbols = coins.map(c => c.taiSan.kyHieu).join(",");
      const res = await cryptoApi.getMarketPrices(symbols);
      setMarketPrices(res.data);
    } catch (e) {
      console.error("Lỗi khi tải giá thị trường:", e);
    } finally {
      setPricesLoading(false);
    }
  }, []);

  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [portfolioRes, assetsRes, walletsRes] = await Promise.all([
        cryptoApi.getPortfolio(),
        cryptoApi.getAvailableAssets(),
        viTienApi.getAll(),
      ]);
      
      const portfolioData = portfolioRes.data;
      const assetsData = assetsRes.data;
      const walletsData = walletsRes.data;
      
      setPortfolio(portfolioData);
      setAvailableAssets(assetsData);
      setUserWallets(walletsData);
      
      if (assetsData.length > 0 && !addCoinForm.taiSanId) {
        setAddCoinForm((p) => ({ ...p, taiSanId: assetsData[0].id.toString() }));
      }
      
      // Sau khi lấy portfolio, lấy luôn giá thị trường
      if (portfolioData.length > 0) {
        fetchMarketPrices(portfolioData);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || e.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [addCoinForm.taiSanId, fetchMarketPrices]);

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
  const fetchLivePrice = async (symbol: string, currency = "VND") => {
    const s = symbol.toUpperCase();
    if (marketPrices[s]) {
      const prices = marketPrices[s];
      return currency === "USD" ? (prices?.usd || 0) : (prices?.vnd || 0);
    }

    try {
      const res = await cryptoApi.getMarketPrices(symbol);
      const data = res.data;
      // Thử tìm theo ký hiệu hoặc tên ID (bitcoin, ethereum...)
      const prices = data[s] || data[symbol.toLowerCase()];
      
      // Cập nhật lại marketPrices chung để các chỗ khác cũng dùng được
      if (prices) {
        setMarketPrices(prev => ({ ...prev, [s]: prices }));
      }
      return currency === "USD" ? (prices?.usd || 0) : (prices?.vnd || 0);
    } catch (e) {
      console.error("Lỗi khi lấy giá live:", e);
      return 0;
    }
  };

  // Tự động điền giá khi chọn coin ở Modal Thêm Mới
  useEffect(() => {
    if (!addCoinForm.taiSanId || !isAddCoinOpen) return;
    const coin = availableAssets.find(c => c.id.toString() === addCoinForm.taiSanId);
    if (!coin) return;

    fetchLivePrice(coin.kyHieu, addCoinForm.tienTe).then(price => {
      if (price > 0) {
        setAddCoinForm(prev => ({ ...prev, giaMuaTrungBinh: formatPriceInput(price, addCoinForm.tienTe) }));
      }
    });
  }, [addCoinForm.taiSanId, isAddCoinOpen, availableAssets, addCoinForm.tienTe]);

  // Tự động điền giá hiện tại khi mở Modal Ghi Lệnh
  useEffect(() => {
    if (!selectedCoin || !isTxModalOpen) return;
    fetchLivePrice(selectedCoin.taiSan.kyHieu, txForm.tienTe).then(price => {
      if (price > 0) {
        setTxForm(prev => ({ ...prev, gia: formatPriceInput(price, txForm.tienTe) }));
      }
    });
  }, [selectedCoin, isTxModalOpen, txForm.tienTe]);

  // ========================
  //  ADD COIN TO PORTFOLIO
  // ========================
  const handleAddCoin = async () => {
    if (!addCoinForm.taiSanId || !addCoinForm.diaChiVi) {
      setError("Vui lòng chọn coin và ví gắn kết.");
      return;
    }
    try {
      await cryptoApi.addCoin(addCoinForm.taiSanId, {
          soLuong: parseFloat(addCoinForm.soLuong) || 0,
          giaMuaTrungBinh: parsePriceInput(addCoinForm.giaMuaTrungBinh, addCoinForm.tienTe),
          diaChiVi: addCoinForm.diaChiVi || "",
          viId: addCoinForm.viId || null, 
          tienTe: addCoinForm.tienTe, // Gửi loại tiền tệ nhập liệu
      });
      showSuccess("Đã thêm coin vào danh mục!");
      setIsAddCoinOpen(false);
      setAddCoinForm({ 
        taiSanId: availableAssets[0]?.id.toString() || "", 
        soLuong: "", 
        giaMuaTrungBinh: "0", 
        diaChiVi: "", 
        viId: "",
        tienTe: "VND" 
      });
      fetchPortfolio();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoin = async (id: string) => {
    if (!confirm("Xóa coin này khỏi danh mục? Toàn bộ lịch sử giao dịch sẽ bị xóa.")) return;
    try {
      await cryptoApi.deleteCoin(id);
      showSuccess("Đã xóa coin.");
      fetchPortfolio();
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
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
      const res = await cryptoApi.getTransactions(coin.id);
      setTransactions(res.data);
    } catch (e: any) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setTxLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!selectedCoin || !txForm.soLuong || !txForm.gia || !txForm.viId) {
      setError("Vui lòng điền đầy đủ thông tin và chọn ví thanh toán.");
      return;
    }
    setTxLoading(true);
    try {
      await cryptoApi.addTransaction(selectedCoin.id, {
        loai: txForm.loai,
        soLuong: parseFloat(txForm.soLuong),
        gia: parsePriceInput(txForm.gia, txForm.tienTe),
        ngayGiaoDich: txForm.ngayGiaoDich,
        viId: txForm.viId, 
        tienTe: txForm.tienTe, // Gửi loại tiền tệ nhập liệu
      });
      showSuccess(txForm.loai === "buy" ? "Ghi nhận lệnh Mua thành công!" : "Ghi nhận lệnh Bán thành công!");
      setIsTxModalOpen(false);
      fetchPortfolio(); // Tải lại danh mục và ví tiền
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi khi ghi nhận giao dịch.");
    } finally {
      setTxLoading(false);
    }
  };

  const handleDeleteTransaction = async (txId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa giao dịch này? Tiền trong ví sẽ được hoàn trả/khấu trừ tương ứng.")) return;
    try {
      await cryptoApi.deleteTransaction(txId);
      showSuccess("Đã xóa giao dịch thành công.");
      
      // Tải lại dữ liệu
      if (selectedCoin) {
        const res = await cryptoApi.getTransactions(selectedCoin.id);
        setTransactions(res.data);
      }
      fetchPortfolio();
    } catch (e: any) {
      setError(e.response?.data?.message || "Lỗi khi xóa giao dịch.");
    }
  };

  // ========================
  //  Stats (Optimized with useMemo)
  // ========================
  const stats = useMemo(() => {
    // Backend đã chuẩn hóa giaMuaTrungBinh về VND, nên tính trực tiếp
    const vdt = portfolio.reduce((s, c) => s + (c.soLuong || 0) * (c.giaMuaTrungBinh || 0), 0);

    const gtht = portfolio.reduce((s, c) => {
      const symbol = c.taiSan.kyHieu.toUpperCase();
      const prices = marketPrices[symbol];
      if (!prices || prices.vnd === undefined) return s;
      return s + (c.soLuong || 0) * (prices.vnd || 0);
    }, 0);

    const ll = Number.isNaN(gtht) ? 0 : gtht - vdt;
    const ptll = vdt > 0 ? (ll / vdt) * 100 : 0;

    return { tongVonDauTu: vdt, tongGiaTriHienTai: gtht, tongLaiLo: ll, phanTramLaiLo: ptll };
  }, [portfolio, userWallets, marketPrices]);

  const { tongVonDauTu, tongGiaTriHienTai, tongLaiLo, phanTramLaiLo } = stats;


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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng vốn đầu tư", value: formatCurrency(tongVonDauTu), icon: <Wallet className="w-5 h-5" />, color: "amber" },
          { 
            label: "Giá trị hiện tại", 
            value: pricesLoading ? <span className="animate-pulse text-slate-300">Đang tính...</span> : formatCurrency(tongGiaTriHienTai), 
            icon: <BarChart3 className="w-5 h-5" />, 
            color: "indigo" 
          },
          { 
            label: "Tổng Lãi/Lỗ", 
            value: pricesLoading ? <span className="animate-pulse text-slate-300">...</span> : (
              <span className={tongLaiLo >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {tongLaiLo >= 0 ? "+" : ""}{formatCurrency(tongLaiLo)}
              </span>
            ), 
            icon: tongLaiLo >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />, 
            color: tongLaiLo >= 0 ? "emerald" : "rose",
            subValue: pricesLoading ? undefined : `${phanTramLaiLo >= 0 ? "+" : ""}${phanTramLaiLo.toFixed(2)}%`
          },
          { 
            label: "Trạng thái", 
            value: loading || pricesLoading ? "Đang tải..." : "Đã cập nhật", 
            icon: <RefreshCw className={`w-5 h-5 ${(loading || pricesLoading) ? "animate-spin" : ""}`} />, 
            color: "sky",
            onClick: () => fetchPortfolio() 
          },
        ].map((stat, i) => (
          <Card key={i} className={`border-none shadow-sm rounded-2xl bg-white ${stat.onClick ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""}`} onClick={stat.onClick}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center 
                ${stat.color === "amber" ? "bg-amber-50 text-amber-500" : 
                  stat.color === "indigo" ? "bg-indigo-50 text-indigo-500" : 
                  stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                  stat.color === "rose" ? "bg-rose-50 text-rose-500" : "bg-sky-50 text-sky-500"}`}>
                {stat.icon}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-black text-slate-800">{stat.value}</p>
                  {stat.subValue && (
                    <span className={`text-[10px] font-bold ${tongLaiLo >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                      ({stat.subValue})
                    </span>
                  )}
                </div>
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
              const wallet = userWallets.find(w => w.tenVi === coin.diaChiVi);
              const currency = wallet?.tienTe || "VND";
              const gradient = getCryptoGradient(coin.taiSan?.kyHieu);
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 relative group/price">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá thị trường ({currency})</p>
                        <div className="flex items-center justify-between">
                          <p className="font-black text-indigo-600 text-base">
                            {marketPrices[coin.taiSan.kyHieu.toUpperCase()] 
                              ? formatCurrency(
                                  currency === "USD" 
                                    ? marketPrices[coin.taiSan.kyHieu.toUpperCase()].usd || 0 
                                    : marketPrices[coin.taiSan.kyHieu.toUpperCase()].vnd || 0, 
                                  currency
                                )
                              : "---"}
                          </p>
                          <button onClick={() => fetchMarketPrices([coin])} className="text-slate-200 hover:text-indigo-400 p-0.5 transition-colors">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lãi / Lỗ ({currency})</p>
                        {(() => {
                          const prices = marketPrices[coin.taiSan.kyHieu.toUpperCase()];
                          if (!prices || prices.vnd === undefined) {
                            return <p className="font-black text-slate-400 text-base">---</p>;
                          }
                          // Luôn dùng VND để tính P&L vì giaMuaTrungBinh là VND
                          const marketPriceVnd = prices.vnd || 0;
                          const buyPriceVnd = coin.giaMuaTrungBinh || 0;
                          
                          let profitVnd = (marketPriceVnd - buyPriceVnd) * (coin.soLuong || 0);
                          const profitPct = buyPriceVnd > 0 ? ((marketPriceVnd - buyPriceVnd) / buyPriceVnd) * 100 : 0;
                          
                          // Quy đổi hiển thị Lãi Lỗ theo đơn vị ví
                          const profitToDisplay = currency === "USD" ? profitVnd / 25400 : profitVnd;
                          const isProfit = profitToDisplay >= 0;
                          return (
                            <div className="flex flex-col">
                              <p className={`font-black text-base ${isProfit ? "text-emerald-500" : "text-rose-500"}`}>
                                {isProfit ? "+" : ""}{formatCurrency(profitToDisplay, currency)}
                              </p>
                              <span className={`text-[10px] font-bold ${isProfit ? "text-emerald-500" : "text-rose-500"}`}>
                                {isProfit ? "↑" : "↓"} {Math.abs(profitPct).toFixed(2)}%
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Giá trị hiện tại</p>
                        <p className="font-black text-slate-700">
                          {marketPrices[coin.taiSan.kyHieu.toUpperCase()] 
                            ? formatCurrency(
                                (currency === "USD" 
                                  ? (marketPrices[coin.taiSan.kyHieu.toUpperCase()].usd || 0)
                                  : (marketPrices[coin.taiSan.kyHieu.toUpperCase()].vnd || 0)) * (coin.soLuong || 0),
                                currency
                              )
                            : formatCurrency(0, currency)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500 bg-amber-50 px-3 py-1.5 rounded-xl">
                        <History className="w-3.5 h-3.5" />
                        Chi tiết
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                    Giá mua TB ({addCoinForm.tienTe})
                  </label>
                  <div className="relative group">
                    <Input
                      type="text"
                      placeholder="0"
                      value={addCoinForm.giaMuaTrungBinh}
                      onChange={(e) => setAddCoinForm({ ...addCoinForm, giaMuaTrungBinh: formatPriceInput(e.target.value, addCoinForm.tienTe) })}
                      className="h-11 rounded-xl bg-slate-50 border-none font-bold text-slate-800 pr-16"
                    />
                    <div className="absolute right-1 top-1 bottom-1 flex items-center bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                      {["USD", "VND"].map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            const currentVal = parsePriceInput(addCoinForm.giaMuaTrungBinh, addCoinForm.tienTe);
                            let newVal = currentVal;
                            if (addCoinForm.tienTe === "VND" && curr === "USD") newVal = currentVal / USD_VND_RATE;
                            if (addCoinForm.tienTe === "USD" && curr === "VND") newVal = currentVal * USD_VND_RATE;
                            
                            setAddCoinForm({ 
                              ...addCoinForm, 
                              tienTe: curr,
                              giaMuaTrungBinh: formatPriceInput(newVal, curr)
                            });
                          }}
                          className={`px-2 h-full text-[9px] font-black transition-all ${addCoinForm.tienTe === curr ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Gắn với ví nào?</label>
                <select
                  value={addCoinForm.viId}
                  onChange={(e) => {
                    const wallet = userWallets.find(w => w.id === e.target.value);
                    setAddCoinForm({ 
                      ...addCoinForm, 
                      viId: e.target.value, 
                      diaChiVi: wallet ? wallet.tenVi : "",
                      tienTe: wallet?.tienTe || "VND" // Tự động nhảy theo ví
                    });
                  }}
                  className="w-full h-11 pl-4 pr-8 rounded-xl bg-slate-50 border-none font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-100 appearance-none"
                >
                  <option value="">-- Chọn ví (tùy chọn) --</option>
                  {userWallets.map((w) => (
                    <option key={w.id} value={w.id}>{w.tenVi} (Số dư: {formatCurrency(w.soDu, w.tienTe)})</option>
                  ))}
                </select>
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
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                      GIÁ ({txForm.tienTe})
                    </label>
                    <div className="relative group">
                      <Input type="text" placeholder="0"
                        value={txForm.gia}
                        onChange={(e) => setTxForm({ ...txForm, gia: formatPriceInput(e.target.value, txForm.tienTe) })}
                        className="h-11 rounded-xl bg-white border-slate-100 font-bold text-slate-800 pr-16"
                      />
                      <div className="absolute right-1 top-1 bottom-1 flex items-center bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
                        {["USD", "VND"].map((curr) => (
                          <button
                            key={curr}
                            onClick={() => {
                              const currentVal = parsePriceInput(txForm.gia, txForm.tienTe);
                              let newVal = currentVal;
                              if (txForm.tienTe === "VND" && curr === "USD") newVal = currentVal / USD_VND_RATE;
                              if (txForm.tienTe === "USD" && curr === "VND") newVal = currentVal * USD_VND_RATE;

                              setTxForm({ 
                                ...txForm, 
                                tienTe: curr,
                                gia: formatPriceInput(newVal, curr)
                              });
                            }}
                            className={`px-2 h-full text-[9px] font-black transition-all ${txForm.tienTe === curr ? "bg-amber-500 text-white" : "text-slate-400 hover:bg-slate-50"}`}
                          >
                            {curr}
                          </button>
                        ))}
                      </div>
                    </div>
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
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-1">Ví thanh toán</label>
                  <select
                    value={txForm.viId}
                    onChange={(e) => {
                      const wallet = userWallets.find(w => w.id === e.target.value);
                      setTxForm({ 
                        ...txForm, 
                        viId: e.target.value,
                        tienTe: wallet?.tienTe || "VND" // Tự động nhảy theo ví
                      });
                    }}
                    className="w-full h-11 pl-4 pr-8 rounded-xl bg-white border-slate-100 font-bold text-slate-800 text-sm focus:ring-2 focus:ring-amber-100 appearance-none"
                  >
                    <option value="">-- Chọn ví giao dịch --</option>
                    {userWallets.map((w) => (
                      <option key={w.id} value={w.id}>{w.tenVi} (Số dư: {formatCurrency(w.soDu, w.tienTe)})</option>
                    ))}
                  </select>
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
                ) : transactions.length > 0 ? (
                  [...transactions]
                    .sort((a, b) => new Date(b.ngayGiaoDich).getTime() - new Date(a.ngayGiaoDich).getTime())
                    .map((tx) => {
                      const walletObj = userWallets.find(w => w.id === tx.viId) || userWallets.find(w => w.tenVi === selectedCoin.diaChiVi);
                      const txCurrency = walletObj?.tienTe || "VND";
                      return (
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
                                @ {formatNumber(tx.gia, 0)} {txCurrency} • {new Date(tx.ngayGiaoDich).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className={`font-black text-sm ${tx.loai === "buy" ? "text-rose-600" : "text-emerald-600"}`}>
                              {tx.loai === "buy" ? "-" : "+"}{formatCurrency(tx.soLuong * tx.gia, userWallets.find(w => w.id === tx.viId)?.tienTe || "VND")}
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
                      );
                    })
                ) : (
                  <div className="py-10 text-center">
                    <History className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-medium">Chưa có giao dịch nào.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
