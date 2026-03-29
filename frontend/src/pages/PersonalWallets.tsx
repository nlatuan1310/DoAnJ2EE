import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Button,
} from "@/components/ui/button";
import {
  Badge,
} from "@/components/ui/badge";
import {
  Input,
} from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Wallet,
  Loader2,
  CreditCard,
  Share2,
  Pencil,
  X,
} from "lucide-react";
import walletService, { Wallet as WalletType } from "@/services/walletService";
import { getCurrentUserId } from "@/services/api";

const formatCurrency = (n: number, currency: string = "VND") => {
  try {
    return new Intl.NumberFormat(currency === "USD" ? "en-US" : "vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(n);
  } catch (error) {
    return `${n} ${currency}`;
  }
};

export default function PersonalWallets() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserId();

  // Modal states
  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);

  // Form states
  const [newWallet, setNewWallet] = useState({ tenVi: "", tienTe: "VND", soDu: 0 });
  const [editWalletData, setEditWalletData] = useState({ tenVi: "", tienTe: "VND", soDu: 0 });
  const [inviteEmail, setInviteEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await walletService.getWallets(userId);
      const personal = res.data.filter((w: WalletType) => 
        w.vaiTro === 'OWNER' && !w.nhom && (w.soThanhVien || 0) === 0
      );
      setWallets(personal);
    } catch (err: any) {
      console.error(err);
      setError("Không thể tải danh sách ví cá nhân.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    setActionLoading(true);
    try {
      await walletService.createWallet(userId, newWallet);
      setIsAddWalletOpen(false);
      setNewWallet({ tenVi: "", tienTe: "VND", soDu: 0 });
      fetchWallets();
    } catch (err: any) {
      alert("Lỗi khi tạo ví.");
    } finally {
      setActionLoading(false);
    }
  };

  const openEditWallet = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setEditWalletData({ tenVi: wallet.tenVi, tienTe: wallet.tienTe, soDu: wallet.soDu });
    setIsEditWalletOpen(true);
  };

  const handleUpdateWallet = async () => {
    if (!selectedWallet) return;
    setActionLoading(true);
    try {
      await walletService.updateWallet(selectedWallet.id, editWalletData);
      setIsEditWalletOpen(false);
      fetchWallets();
    } catch (err) {
      alert("Lỗi khi cập nhật ví.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa ví này?")) return;
    try {
      await walletService.deleteWallet(id);
      fetchWallets();
    } catch (err) {
      alert("Lỗi khi xóa ví.");
    }
  };

  const openManageMembers = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setIsManageMembersOpen(true);
  };

  const handleInvite = async () => {
    if (!selectedWallet) return;
    setActionLoading(true);
    try {
      await walletService.addMember(selectedWallet.id, inviteEmail, "VIEWER");
      setInviteEmail("");
      setIsManageMembersOpen(false);
      fetchWallets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi mời thành viên.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Ví cá nhân</h1>
          <p className="text-slate-500 mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500" />
            Tổ chức nguồn tiền riêng tư của bạn một cách an toàn
          </p>
        </div>
        <Button onClick={() => setIsAddWalletOpen(true)} className="bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-100 h-12 px-8 font-bold text-lg rounded-xl transition-all active:scale-95">
          <Plus className="w-5 h-5 mr-2" />
          Tạo ví mới
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-32 gap-4">
          <Loader2 className="w-12 h-12 text-violet-600 animate-spin" />
          <p className="text-slate-400 font-medium animate-pulse">Đang tải danh sách ví...</p>
        </div>
      ) : error ? (
        <Card className="border-rose-100 bg-rose-50/30 p-16 text-center">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{error}</h3>
          <Button variant="outline" className="mt-4 border-rose-200 text-rose-600 hover:bg-rose-50" onClick={fetchWallets}>Thử lại</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="group relative overflow-hidden border-slate-200 hover:border-violet-400 hover:shadow-2xl transition-all duration-500 bg-white rounded-2xl decoration-clone">
              <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rotate-45 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 group-hover:scale-150 transition-transform duration-700" />
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-4 rounded-2xl bg-violet-50 text-violet-600 shadow-inner group-hover:scale-110 transition-transform">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold px-3 py-1 text-[10px] uppercase tracking-tighter">Cá nhân</Badge>
                </div>
                <CardTitle className="text-2xl font-black text-slate-800 group-hover:text-violet-700 transition-colors uppercase tracking-tight">{wallet.tenVi}</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Đơn vị: {wallet.tienTe}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="bg-slate-50/50 rounded-2xl p-6 text-center border border-slate-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2 block">Số dư hiện dụng</span>
                  <div className="text-3xl font-black text-slate-900 tracking-tighter">{formatCurrency(wallet.soDu, wallet.tienTe)}</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="lg" className="flex-1 rounded-xl h-11 border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all font-bold" onClick={() => openEditWallet(wallet)}>
                    <Pencil className="w-4 h-4 mr-2" /> Sửa
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1 rounded-xl h-11 border-slate-200 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 transition-all font-bold" onClick={() => openManageMembers(wallet)}>
                    <Share2 className="w-4 h-4 mr-2" /> Chia sẻ
                  </Button>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDeleteWallet(wallet.id)}>
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {wallets.length === 0 && (
            <Card className="col-span-full border-dashed border-2 border-slate-200 bg-slate-50/50 py-32 text-center rounded-3xl">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <Wallet className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có ví cá nhân</h3>
              <p className="text-slate-400 max-w-xs mx-auto mb-8 text-sm">Hãy bắt đầu bằng cách tạo một ví mới để quản lý chi tiêu của bạn.</p>
              <Button onClick={() => setIsAddWalletOpen(true)} variant="outline" className="border-violet-200 text-violet-600 hover:bg-violet-50 rounded-xl px-8 font-bold">
                Tạo ngay bây giờ
              </Button>
            </Card>
          )}
        </div>
      )}

      {/* Edit Wallet Modal */}
      <Dialog open={isEditWalletOpen} onOpenChange={setIsEditWalletOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-slate-900 p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Cập nhật thông tin ví</DialogTitle>
              <DialogDescription className="text-slate-400">Thay đổi tên hoặc loại tiền tệ của ví.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tên ví mới</label>
                <Input value={editWalletData.tenVi} onChange={e => setEditWalletData({...editWalletData, tenVi: e.target.value})} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:ring-violet-500/20 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tiền tệ</label>
                <select className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none ring-offset-white focus:ring-2 focus:ring-violet-500/20" value={editWalletData.tienTe} onChange={e => setEditWalletData({...editWalletData, tienTe: e.target.value})}>
                  <option value="VND">Vietnam Dong (VND)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Tổng số dư</label>
                <Input type="number" value={editWalletData.soDu} onChange={e => setEditWalletData({...editWalletData, soDu: Number(e.target.value)})} className="h-12 bg-slate-50 rounded-xl border-slate-200 focus:ring-violet-500/20 transition-all font-bold text-slate-900" />
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 h-14 rounded-xl font-black text-white shadow-lg shadow-violet-200" onClick={handleUpdateWallet} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin" /> : "LƯU THAY ĐỔI"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Wallet Modal */}
      <Dialog open={isAddWalletOpen} onOpenChange={setIsAddWalletOpen}>
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 p-10 text-white relative">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <DialogHeader className="p-0">
              <DialogTitle className="text-3xl font-black text-white">Khởi tạo ví mới</DialogTitle>
              <DialogDescription className="text-violet-100 max-w-xs mt-2 text-base">Thiết lập nguồn tiền cá nhân của bạn để bắt đầu theo dõi thu chi.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-8 bg-white">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tên ví gợi nhớ</label>
                <Input placeholder="Ví dụ: Ví tiêu dùng hằng ngày" value={newWallet.tenVi} onChange={e => setNewWallet({...newWallet, tenVi: e.target.value})} className="h-14 bg-slate-50 rounded-2xl border-slate-200 text-lg font-medium focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Số dư đầu kỳ</label>
                  <Input type="number" placeholder="0" value={newWallet.soDu} onChange={e => setNewWallet({...newWallet, soDu: Number(e.target.value)})} className="h-14 bg-slate-50 rounded-2xl border-slate-200 text-lg font-bold text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tiền tệ</label>
                   <select className="w-full h-14 px-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-violet-500/20" value={newWallet.tienTe} onChange={e => setNewWallet({...newWallet, tienTe: e.target.value})}>
                    <option value="VND">VND</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 h-16 rounded-2xl font-black text-lg text-white shadow-2xl shadow-violet-200 active:scale-[0.98] transition-all" onClick={handleAddWallet} disabled={actionLoading || !newWallet.tenVi.trim()}>
              {actionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "XÁC NHẬN TẠO VÍ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Wallet Modal */}
      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
          <div className="bg-emerald-600 p-10 text-white">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Share2 className="w-8 h-8 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white">Chia sẻ ví</DialogTitle>
              <DialogDescription className="text-emerald-50 mt-2">Mời người khác cùng quản lý nguồn tiền này. Ví sẽ tự động chuyển sang mục Ví nhóm.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-6 bg-white">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email người nhận</label>
                <Input placeholder="user@example.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} className="h-14 rounded-2xl border-slate-200 focus:bg-emerald-50/10 transition-all font-medium" />
              </div>
              <p className="text-[10px] text-slate-400 italic px-1">* Người được mời sẽ có quyền Viewer mặc định. Bạn có thể thay đổi quyền trong mục Ví nhóm sau khi mời.</p>
            </div>
            <div className="flex gap-4">
               <Button variant="ghost" className="flex-1 h-14 rounded-2xl font-bold text-slate-500" onClick={() => setIsManageMembersOpen(false)}>HỦY</Button>
               <Button className="flex-[2] bg-emerald-600 hover:bg-emerald-700 h-14 rounded-2xl font-black text-white shadow-xl shadow-emerald-100" onClick={handleInvite} disabled={actionLoading || !inviteEmail}>
                 {actionLoading ? <Loader2 className="animate-spin" /> : "GỬI LỜI MỜI"}
               </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
