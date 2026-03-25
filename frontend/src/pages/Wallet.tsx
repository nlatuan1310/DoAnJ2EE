import { useState, useEffect, useCallback } from "react";
import {
  Plus, Edit2, Trash2, Users, X, Search, Check,
  Wallet as WalletIcon, UserPlus, Crown, Eye, Pencil,
  RefreshCw, AlertCircle, CheckCircle2, ChevronRight,
  Coins, Shield, Share2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { viTienApi, thanhVienViApi, nguoiDungSearchApi } from "@/services/walletService";
import { getCurrentUserId } from "@/services/api";

// ===== TYPES =====
interface ViTien {
  id: string;
  tenVi: string;
  tienTe: string;
  soDu: number;
  chuSoHuu?: { id: string; hoVaTen: string; email: string };
  ngayTao?: string;
}

interface ThanhVienVi {
  id: { viId: string; nguoiDungId: string };
  vaiTro: string;
  viTien?: ViTien;
  nguoiDung?: { id: string; hoVaTen: string; email: string };
}

interface NguoiDung {
  id: string;
  hoVaTen: string;
  email: string;
}

// ===== CONSTANTS =====
const CURRENCIES = ["VND", "USD", "EUR", "JPY", "SGD", "THB"];
const ROLES = [
  { value: "owner", label: "Chủ sở hữu", icon: Crown, color: "text-amber-600 bg-amber-50" },
  { value: "editor", label: "Biên tập viên", icon: Pencil, color: "text-blue-600 bg-blue-50" },
  { value: "viewer", label: "Người xem", icon: Eye, color: "text-slate-600 bg-slate-50" },
];

const getRoleInfo = (role: string) =>
  ROLES.find((r) => r.value === role) || ROLES[2];

const fmt = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
      maximumFractionDigits: currency === "VND" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${new Intl.NumberFormat("vi-VN").format(amount)} ${currency}`;
  }
};

// ===== MAIN COMPONENT =====
export default function Wallet() {
  const currentUserId = getCurrentUserId();

  // Data states
  const [myWallets, setMyWallets] = useState<ViTien[]>([]);
  const [sharedMembers, setSharedMembers] = useState<Record<string, ThanhVienVi[]>>({});
  const [sharedWithMe, setSharedWithMe] = useState<ThanhVienVi[]>([]);

  // Loading / feedback
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Wallet form modal
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<ViTien | null>(null);
  const [walletForm, setWalletForm] = useState({ tenVi: "", tienTe: "VND", soDu: "" });

  // Members modal
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<ViTien | null>(null);
  const [members, setMembers] = useState<ThanhVienVi[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [foundUser, setFoundUser] = useState<NguoiDung | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // ===== DATA FETCHING =====
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [walletsRes, sharedRes] = await Promise.all([
        viTienApi.getAll(),
        thanhVienViApi.getSharedWallets(),
      ]);
      setMyWallets(walletsRes.data || []);

      // Filter out wallets the user owns from shared list
      const shared: ThanhVienVi[] = (sharedRes.data || []).filter(
        (m: ThanhVienVi) =>
          m.vaiTro !== "owner" &&
          m.nguoiDung?.id !== currentUserId
      );
      setSharedWithMe(shared);

      // Load member counts for my wallets in parallel
      if (walletsRes.data?.length > 0) {
        const memberResults = await Promise.allSettled(
          walletsRes.data.map((w: ViTien) => thanhVienViApi.getMembers(w.id))
        );
        const memberMap: Record<string, ThanhVienVi[]> = {};
        walletsRes.data.forEach((w: ViTien, idx: number) => {
          const res = memberResults[idx];
          memberMap[w.id] = res.status === "fulfilled" ? res.value.data : [];
        });
        setSharedMembers(memberMap);
      }
    } catch (err: any) {
      setError("Không thể tải dữ liệu ví. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  // ===== WALLET CRUD =====
  const openCreateModal = () => {
    setEditingWallet(null);
    setWalletForm({ tenVi: "", tienTe: "VND", soDu: "" });
    setWalletModalOpen(true);
  };

  const openEditModal = (w: ViTien) => {
    setEditingWallet(w);
    setWalletForm({ tenVi: w.tenVi, tienTe: w.tienTe, soDu: w.soDu?.toString() || "0" });
    setWalletModalOpen(true);
  };

  const handleSaveWallet = async () => {
    if (!walletForm.tenVi.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingWallet) {
        await viTienApi.update(editingWallet.id, {
          tenVi: walletForm.tenVi,
          tienTe: walletForm.tienTe,
        });
        showSuccess("Đã cập nhật ví!");
      } else {
        await viTienApi.create({
          tenVi: walletForm.tenVi,
          tienTe: walletForm.tienTe,
          soDu: parseFloat(walletForm.soDu) || 0,
        });
        showSuccess("Đã tạo ví mới!");
      }
      setWalletModalOpen(false);
      fetchAll();
    } catch (err: any) {
      setError(err.response?.data?.message || "Lỗi khi lưu ví.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWallet = async (w: ViTien) => {
    if (!confirm(`Xác nhận xóa ví "${w.tenVi}"? Không thể hoàn tác.`)) return;
    try {
      await viTienApi.delete(w.id);
      showSuccess("Đã xóa ví.");
      fetchAll();
    } catch {
      setError("Không thể xóa ví. Có thể ví đang được dùng trong giao dịch.");
    }
  };

  // ===== MEMBERS MODAL =====
  const openMembersModal = async (w: ViTien) => {
    setSelectedWallet(w);
    setMembersModalOpen(true);
    setInviteEmail("");
    setInviteRole("viewer");
    setFoundUser(null);
    setSearchError(null);
    await loadMembers(w.id);
  };

  const loadMembers = async (viId: string) => {
    setMembersLoading(true);
    try {
      const res = await thanhVienViApi.getMembers(viId);
      setMembers(res.data || []);
    } catch {
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!inviteEmail.trim()) return;
    setSearchingUser(true);
    setSearchError(null);
    setFoundUser(null);
    try {
      const res = await nguoiDungSearchApi.timTheoEmail(inviteEmail.trim());
      setFoundUser(res.data);
    } catch {
      setSearchError("Không tìm thấy người dùng với email này.");
    } finally {
      setSearchingUser(false);
    }
  };

  const handleAddMember = async () => {
    if (!foundUser || !selectedWallet) return;
    setSaving(true);
    try {
      await thanhVienViApi.addMember(selectedWallet.id, foundUser.id, inviteRole);
      showSuccess(`Đã thêm ${foundUser.hoVaTen} vào ví!`);
      setFoundUser(null);
      setInviteEmail("");
      await loadMembers(selectedWallet.id);
      fetchAll();
    } catch {
      setError("Không thể thêm thành viên.");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (member: ThanhVienVi) => {
    if (!selectedWallet) return;
    if (!confirm(`Xóa ${member.nguoiDung?.hoVaTen} khỏi ví?`)) return;
    try {
      await thanhVienViApi.removeMember(selectedWallet.id, member.id.nguoiDungId);
      showSuccess("Đã xóa thành viên.");
      await loadMembers(selectedWallet.id);
      fetchAll();
    } catch {
      setError("Không thể xóa thành viên.");
    }
  };

  // ===== COMPUTED =====
  const totalBalance = myWallets.reduce((s, w) => s + (w.soDu || 0), 0);
  const totalMembers = Object.values(sharedMembers).reduce((s, m) => s + m.length, 0);

  // ===== RENDER =====
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500">

      {/* ── HEADER ── */}
      <div className="relative overflow-hidden rounded-[2rem] p-8 text-white shadow-xl"
        style={{ background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 50%, #3b82f6 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight">Ví tiền của tôi</h1>
            </div>
            <p className="text-indigo-100/80 text-sm font-medium max-w-md">
              Quản lý ví cá nhân và chia sẻ với nhóm để cùng theo dõi tài chính.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={fetchAll}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 h-11 px-4 rounded-xl"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Làm mới
            </Button>
            <Button
              onClick={openCreateModal}
              className="bg-white text-indigo-700 hover:bg-indigo-50 h-11 px-6 rounded-xl font-bold shadow-lg gap-2"
            >
              <Plus className="w-5 h-5" /> Tạo ví mới
            </Button>
          </div>
        </div>
      </div>

      {/* ── FEEDBACK ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {success}
        </div>
      )}

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng số ví", value: myWallets.length, suffix: "ví", icon: WalletIcon, color: "violet" },
          { label: "Tổng cộng (VND)", value: fmt(totalBalance, "VND"), suffix: "", icon: Coins, color: "indigo" },
          { label: "Thành viên", value: totalMembers, suffix: "người", icon: Users, color: "blue" },
          { label: "Ví được chia sẻ", value: sharedWithMe.length, suffix: "ví", icon: Share2, color: "emerald" },
        ].map((s, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl bg-white hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                <div className={`w-8 h-8 rounded-xl bg-${s.color}-50 flex items-center justify-center`}>
                  <s.icon className={`w-4 h-4 text-${s.color}-500`} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-800">
                {s.value} <span className="text-sm font-bold text-slate-400">{s.suffix}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── MY WALLETS ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <WalletIcon className="w-5 h-5 text-violet-500" /> Ví của tôi
          </h2>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {myWallets.length} ví
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-52 rounded-[2rem] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : myWallets.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <WalletIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-semibold text-lg">Bạn chưa có ví nào</p>
            <p className="text-slate-400 text-sm mt-1">Nhấn "Tạo ví mới" để bắt đầu</p>
            <Button onClick={openCreateModal} className="mt-6 bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-6 gap-2">
              <Plus className="w-4 h-4" /> Tạo ngay
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {myWallets.map((w) => {
              const wMembers = sharedMembers[w.id] || [];
              const isShared = wMembers.length > 1;
              return (
                <Card
                  key={w.id}
                  className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] overflow-hidden bg-white cursor-pointer"
                >
                  {/* Card gradient top bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500" />
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center shadow-inner">
                          <WalletIcon className="w-6 h-6 text-violet-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800 leading-tight">{w.tenVi}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg uppercase">
                              {w.tienTe}
                            </span>
                            {isShared && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                                <Users className="w-3 h-3" /> {wMembers.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action buttons — show on hover */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => openMembersModal(w)}
                          title="Quản lý thành viên"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(w)}
                          title="Sửa ví"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWallet(w)}
                          title="Xóa ví"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 pb-6 space-y-4">
                    {/* Balance */}
                    <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư</p>
                      <p className="text-2xl font-black text-slate-800">{fmt(w.soDu || 0, w.tienTe)}</p>
                    </div>

                    {/* Member avatars */}
                    {wMembers.length > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {wMembers.slice(0, 4).map((m, idx) => (
                            <div
                              key={idx}
                              title={m.nguoiDung?.hoVaTen}
                              className="w-7 h-7 rounded-full border-2 border-white overflow-hidden shadow-sm"
                            >
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.nguoiDung?.hoVaTen || "?")}&background=6d28d9&color=fff&size=56`}
                                alt={m.nguoiDung?.hoVaTen}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {wMembers.length > 4 && (
                            <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center shadow-sm">
                              +{wMembers.length - 4}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => openMembersModal(w)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                        >
                          Quản lý <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {wMembers.length === 0 && (
                      <button
                        onClick={() => openMembersModal(w)}
                        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-bold text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Mời thành viên
                      </button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SHARED WITH ME ── */}
      {sharedWithMe.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-blue-500" /> Ví được chia sẻ với tôi
            </h2>
            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {sharedWithMe.length} ví
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sharedWithMe.map((m, idx) => {
              const roleInfo = getRoleInfo(m.vaiTro);
              const RoleIcon = roleInfo.icon;
              const wallet = m.viTien;
              if (!wallet) return null;
              return (
                <Card key={idx} className="group border-none shadow-sm hover:shadow-lg transition-all duration-300 rounded-[2rem] overflow-hidden bg-white">
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" />
                  <CardHeader className="p-6 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center shadow-inner">
                          <Share2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-base font-bold text-slate-800 leading-tight">{wallet.tenVi}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-lg uppercase">
                              {wallet.tienTe}
                            </span>
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${roleInfo.color}`}>
                              <RoleIcon className="w-3 h-3" /> {roleInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 space-y-4">
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 rounded-2xl p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Số dư</p>
                      <p className="text-2xl font-black text-slate-800">{fmt(wallet.soDu || 0, wallet.tienTe)}</p>
                    </div>
                    {wallet.chuSoHuu && (
                      <div className="flex items-center gap-2 pt-1">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(wallet.chuSoHuu.hoVaTen || "?")}&background=3b82f6&color=fff&size=48`}
                          alt={wallet.chuSoHuu.hoVaTen}
                          className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-700">{wallet.chuSoHuu.hoVaTen}</p>
                          <p className="text-[10px] text-slate-400">Chủ sở hữu</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          WALLET FORM MODAL
      ══════════════════════════════════════════ */}
      {walletModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setWalletModalOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Modal header */}
            <div className="p-6 text-white flex items-center justify-between"
              style={{ background: "linear-gradient(135deg, #6d28d9, #4f46e5)" }}>
              <div className="flex items-center gap-3">
                <WalletIcon className="w-6 h-6" />
                <h2 className="text-xl font-black tracking-tight">
                  {editingWallet ? "Sửa ví" : "Tạo ví mới"}
                </h2>
              </div>
              <button onClick={() => setWalletModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-5">
              {/* Wallet name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tên ví</label>
                <Input
                  value={walletForm.tenVi}
                  onChange={(e) => setWalletForm({ ...walletForm, tenVi: e.target.value })}
                  placeholder="VD: Ví chi tiêu hàng ngày"
                  className="h-12 rounded-xl bg-slate-50 border-none text-slate-800 font-semibold focus:ring-2 focus:ring-violet-200"
                />
              </div>

              {/* Currency */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiền tệ</label>
                <div className="grid grid-cols-3 gap-2">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setWalletForm({ ...walletForm, tienTe: c })}
                      className={`h-11 rounded-xl font-bold text-sm transition-all border-2 ${walletForm.tienTe === c
                        ? "bg-violet-600 border-violet-600 text-white shadow-md"
                        : "bg-white border-slate-100 text-slate-600 hover:border-violet-200"
                        }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial balance (only for create) */}
              {!editingWallet && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số dư ban đầu</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                      {walletForm.tienTe}
                    </span>
                    <Input
                      type="number"
                      value={walletForm.soDu}
                      onChange={(e) => setWalletForm({ ...walletForm, soDu: e.target.value })}
                      placeholder="0"
                      className="h-12 pl-14 rounded-xl bg-slate-50 border-none text-slate-800 font-bold focus:ring-2 focus:ring-violet-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3">
              <Button variant="ghost" onClick={() => setWalletModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:bg-slate-100">
                Hủy
              </Button>
              <Button
                onClick={handleSaveWallet}
                disabled={saving || !walletForm.tenVi.trim()}
                className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : editingWallet ? "Cập nhật" : "Tạo ví"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MEMBERS MODAL
      ══════════════════════════════════════════ */}
      {membersModalOpen && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMembersModalOpen(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">

            {/* Modal header */}
            <div className="p-6 text-white flex items-center justify-between flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #4f46e5, #2563eb)" }}>
              <div>
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  <h2 className="text-xl font-black tracking-tight">Thành viên ví</h2>
                </div>
                <p className="text-indigo-200 text-sm mt-1">{selectedWallet.tenVi}</p>
              </div>
              <button onClick={() => setMembersModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">

              {/* ── Current members list ── */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" /> Danh sách thành viên
                </h3>

                {membersLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-14 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm font-medium">
                    Chưa có thành viên nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {members.map((m, idx) => {
                      const roleInfo = getRoleInfo(m.vaiTro);
                      const RoleIcon = roleInfo.icon;
                      const isCurrentUser = m.id.nguoiDungId === currentUserId;
                      const isOwner = m.vaiTro === "owner";
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(m.nguoiDung?.hoVaTen || "?")}&background=4f46e5&color=fff&size=56`}
                              alt={m.nguoiDung?.hoVaTen}
                              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                            />
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {m.nguoiDung?.hoVaTen}
                                {isCurrentUser && <span className="ml-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">Bạn</span>}
                              </p>
                              <p className="text-[11px] text-slate-400">{m.nguoiDung?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-xl ${roleInfo.color}`}>
                              <RoleIcon className="w-3 h-3" />{roleInfo.label}
                            </span>
                            {!isOwner && !isCurrentUser && (
                              <button
                                onClick={() => handleRemoveMember(m)}
                                className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                title="Xóa thành viên"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Invite new member ── */}
              <div className="space-y-3 border-t border-slate-100 pt-5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <UserPlus className="w-3.5 h-3.5" /> Mời thành viên mới
                </h3>

                {/* Email search */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      value={inviteEmail}
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        setFoundUser(null);
                        setSearchError(null);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                      placeholder="Nhập email người dùng..."
                      className="pl-9 h-11 rounded-xl bg-slate-50 border-none font-medium text-sm focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <Button
                    onClick={handleSearchUser}
                    disabled={searchingUser || !inviteEmail.trim()}
                    className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm"
                  >
                    {searchingUser ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>

                {searchError && (
                  <p className="text-xs text-rose-500 font-medium flex items-center gap-1.5 px-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {searchError}
                  </p>
                )}

                {/* Found user preview */}
                {foundUser && (
                  <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(foundUser.hoVaTen)}&background=4f46e5&color=fff&size=56`}
                        alt={foundUser.hoVaTen}
                        className="w-10 h-10 rounded-full border-2 border-indigo-200 shadow-sm"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800">{foundUser.hoVaTen}</p>
                        <p className="text-xs text-slate-500">{foundUser.email}</p>
                      </div>
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>

                    {/* Role selection */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vai trò</p>
                      <div className="grid grid-cols-3 gap-2">
                        {ROLES.filter(r => r.value !== "owner").map((r) => {
                          const RIcon = r.icon;
                          return (
                            <button
                              key={r.value}
                              onClick={() => setInviteRole(r.value)}
                              className={`flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all border-2 ${inviteRole === r.value
                                ? "bg-indigo-600 border-indigo-600 text-white"
                                : "bg-white border-slate-100 text-slate-600 hover:border-indigo-200"
                                }`}
                            >
                              <RIcon className="w-3 h-3" /> {r.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      onClick={handleAddMember}
                      disabled={saving}
                      className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm gap-2 shadow-md"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                      Thêm vào ví
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
              <Button
                variant="ghost"
                onClick={() => setMembersModalOpen(false)}
                className="w-full h-11 rounded-xl font-bold text-slate-400 hover:bg-slate-100"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
