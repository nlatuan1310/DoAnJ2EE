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
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Trash2,
  Loader2,
  X,
  CreditCard,
  UserPlus,
  Pencil,
  ShieldCheck,
  ShieldAlert,
  ArrowRightLeft,
} from "lucide-react";
import walletService, { Wallet as WalletType, WalletMember } from "@/services/walletService";
import { getCurrentUserId } from "@/services/api";

const fmtVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

export default function GroupWallets() {
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userId = getCurrentUserId();

  // Modal states
  const [isEditWalletOpen, setIsEditWalletOpen] = useState(false);
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null);
  const [members, setMembers] = useState<WalletMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form states
  const [editWalletData, setEditWalletData] = useState({ tenVi: "", tienTe: "VND" });
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await walletService.getWallets(userId);
      const group = res.data.filter((w: WalletType) => 
        w.vaiTro !== 'OWNER' || (w.soThanhVien || 0) > 0
      );
      setWallets(group);
    } catch (err: any) {
      console.error(err);
      setError("Không thể tải danh sách ví nhóm.");
    } finally {
      setLoading(false);
    }
  };

  const openEditWallet = (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setEditWalletData({ tenVi: wallet.tenVi, tienTe: wallet.tienTe });
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
    if (!confirm("Xác xóa ví nhóm này? Mọi dữ liệu giao dịch chung sẽ biến mất.")) return;
    try {
      await walletService.deleteWallet(id);
      fetchWallets();
    } catch (err) {
      alert("Lỗi khi xóa ví.");
    }
  };

  const openManageMembers = async (wallet: WalletType) => {
    setSelectedWallet(wallet);
    setIsManageMembersOpen(true);
    setLoadingMembers(true);
    try {
      const res = await walletService.getMembers(wallet.id);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedWallet) return;
    setActionLoading(true);
    try {
      await walletService.addMember(selectedWallet.id, inviteEmail, inviteRole);
      setInviteEmail("");
      const res = await walletService.getMembers(selectedWallet.id);
      setMembers(res.data);
      fetchWallets();
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi khi mời thành viên.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (mId: string, role: string) => {
    if (!selectedWallet) return;
    try {
      await walletService.updateMemberRole(selectedWallet.id, mId, role);
      const res = await walletService.getMembers(selectedWallet.id);
      setMembers(res.data);
    } catch (err) {
      alert("Lỗi.");
    }
  };

  const handleRemoveMember = async (mId: string) => {
    if (!selectedWallet || !confirm("Xóa thành viên khỏi nhóm?")) return;
    try {
      await walletService.removeMember(selectedWallet.id, mId);
      const res = await walletService.getMembers(selectedWallet.id);
      setMembers(res.data);
      fetchWallets();
    } catch (err) {
      alert("Lỗi.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1250px] mx-auto space-y-10">
      <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 border-b border-slate-100 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <span className="p-3 bg-emerald-100 text-emerald-600 rounded-3xl">
              <Users className="w-8 h-8" />
            </span>
            Ví nhóm & Chia sẻ
          </h1>
          <p className="text-slate-500 mt-3 text-lg font-medium">Quản lý tài chính tập thể với sự minh bạch tuyệt đối</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-40 gap-6">
          <div className="relative">
             <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
             <ArrowRightLeft className="w-6 h-6 text-emerald-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase animate-pulse">Đang đồng bộ dữ liệu nhóm...</p>
        </div>
      ) : error ? (
        <Card className="border-rose-100 bg-rose-50/20 p-20 text-center rounded-3xl">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 mb-2">{error}</h3>
          <p className="text-slate-500 mb-8 max-w-sm mx-auto">Vui lòng kiểm tra kết nối mạng của bạn và thử lại.</p>
          <Button variant="outline" className="h-14 px-10 rounded-2xl border-rose-200 text-rose-600 font-bold" onClick={fetchWallets}>
            Thử lại ngay
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wallets.map((wallet) => {
            const isOwner = wallet.vaiTro === 'OWNER';
            return (
              <Card key={wallet.id} className="group relative overflow-hidden border-slate-200 hover:border-emerald-400 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] transition-all duration-500 bg-white rounded-[2rem]">
                <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${isOwner ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                <CardHeader className="pb-0 pt-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-2xl shadow-sm ${isOwner ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform duration-500`}>
                      {isOwner ? <ShieldCheck className="w-7 h-7" /> : <CreditCard className="w-7 h-7" />}
                    </div>
                    <Badge className={`px-4 py-1.5 rounded-full border-none font-black text-[10px] uppercase tracking-widest ${isOwner ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {isOwner ? 'Quản trị viên' : wallet.vaiTro}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors uppercase truncate">{wallet.tenVi}</CardTitle>
                   <CardDescription className="flex items-center gap-2 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Chủ sở hữu:</span>
                    <span className="text-slate-600 text-xs font-black italic">{isOwner ? 'Bạn' : wallet.tenChuSoHuu}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-10">
                  <div className="bg-slate-50/80 rounded-3xl p-8 text-center border border-slate-100/50 shadow-inner group-hover:bg-white transition-colors duration-500">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3 block">Số dư hợp nhất</span>
                    <div className="text-4xl font-black text-slate-900 tracking-tighter">{fmtVND(wallet.soDu)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2 p-2 px-3 bg-slate-50 rounded-xl">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-black text-slate-700">{(wallet.soThanhVien || 0) + 1} <span className="text-slate-400 font-medium">THÀNH VIÊN</span></span>
                    </div>
                    <Badge variant="outline" className="border-slate-100 text-[10px] text-slate-400 font-bold">{wallet.tienTe}</Badge>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {isOwner ? (
                      <>
                        <Button variant="outline" size="lg" className="flex-1 rounded-2xl h-12 border-slate-200 hover:border-violet-300 hover:text-violet-600 font-bold transition-all" onClick={() => openEditWallet(wallet)}>
                          <Pencil className="w-4 h-4 mr-2" /> Sửa
                        </Button>
                        <Button variant="outline" size="lg" className="flex-1 rounded-2xl h-12 border-slate-200 hover:border-violet-300 hover:text-violet-600 font-bold transition-all" onClick={() => openManageMembers(wallet)}>
                          <UserPlus className="w-4 h-4 mr-2" /> Nhóm
                        </Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all" onClick={() => handleDeleteWallet(wallet.id)}>
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-between p-4 px-6 rounded-2xl bg-slate-50 text-slate-600 text-xs font-black border border-slate-100">
                        <div className="flex items-center gap-3">
                           <ShieldAlert className="w-4 h-4 text-emerald-500" />
                           BẠN LÀ {wallet.vaiTro}
                        </div>
                        <ArrowRightLeft className="w-4 h-4 opacity-20" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {wallets.length === 0 && (
            <Card className="col-span-full border-dashed border-2 border-slate-200 bg-slate-50/50 py-40 text-center rounded-[3rem]">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
                <Users className="w-12 h-12 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-700 mb-4">Chưa có hoạt động nhóm</h3>
              <p className="text-slate-400 max-w-sm mx-auto mb-10 text-base font-medium">Chia sẻ ví của bạn với người thân hoặc đợi lời mời tham gia từ bạn bè.</p>
            </Card>
          )}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditWalletOpen} onOpenChange={setIsEditWalletOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-0 overflow-hidden border-none shadow-3xl">
          <div className="bg-slate-900 p-10 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white">Cập nhật ví nhóm</DialogTitle>
              <DialogDescription className="text-slate-400 text-base mt-2">Đồng bộ thông tin ví cho tất cả thành viên trong nhóm.</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-10 space-y-8 bg-white">
            <div className="space-y-6">
              <div className="space-y-2 px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên hiển thị mới</label>
                <Input value={editWalletData.tenVi} onChange={e => setEditWalletData({...editWalletData, tenVi: e.target.value})} className="h-14 bg-slate-50 rounded-2xl border-slate-200 text-lg font-bold focus:bg-white transition-all" />
              </div>
              <div className="space-y-2 px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Đơn vị tiền tệ chính</label>
                <select className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-violet-500/10 transition-all" value={editWalletData.tienTe} onChange={e => setEditWalletData({...editWalletData, tienTe: e.target.value})}>
                  <option value="VND">Vietnam Dong (VND)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
            </div>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 h-16 rounded-2xl font-black text-lg text-white shadow-2xl shadow-violet-200 active:scale-[0.98] transition-all" onClick={handleUpdateWallet} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="animate-spin w-6 h-6" /> : "CẬP NHẬT NGAY"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage Members Modal */}
      <Dialog open={isManageMembersOpen} onOpenChange={setIsManageMembersOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] p-0 rounded-[2.5rem] overflow-hidden border-none shadow-3xl">
          <div className="bg-indigo-600 p-10 text-white relative">
            <DialogHeader>
               <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center mb-6">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-3xl font-black text-white tracking-tight">Hội đồng thành viên</DialogTitle>
              <DialogDescription className="text-indigo-100 text-base mt-2">Quản lý những người có quyền truy cập vào ví: <span className="font-black underline italic">{selectedWallet?.tenVi}</span></DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-10 bg-white overflow-y-auto max-h-[50vh]">
            <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col gap-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Mời cộng tác viên mới</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <Input placeholder="Email người dùng..." className="h-14 flex-[2] bg-white rounded-2xl border-slate-200 font-medium" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
                <select className="px-5 h-14 bg-white border border-slate-200 rounded-2xl text-sm font-black outline-none" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option value="VIEWER">VIEWER (Chỉ xem)</option>
                  <option value="EDITOR">EDITOR (Toàn quyền gd)</option>
                </select>
                <Button className="h-14 px-8 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-white shadow-lg shadow-indigo-100 transition-all active:scale-95" onClick={handleInvite} disabled={actionLoading || !inviteEmail}>
                  MỜI
                </Button>
              </div>
            </div>

            <div className="space-y-6">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Danh sách thành viên ({members.length})</h4>
               {loadingMembers ? (
                  <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-slate-200 animate-spin" /></div>
               ) : (
                <div className="space-y-4">
                   {members.map((m) => (
                    <div key={m.id.nguoiDungId} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[1.5rem] hover:shadow-md transition-shadow">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg">
                            {m.nguoiDung?.hoVaTen?.[0]}
                          </div>
                          <div>
                             <div className="text-base font-black text-slate-800">{m.nguoiDung?.hoVaTen}</div>
                             <div className="text-xs text-slate-400 font-medium">{m.nguoiDung?.email}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          <select className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl outline-none" value={m.vaiTro} onChange={e => handleUpdateRole(m.id.nguoiDungId, e.target.value)}>
                              <option value="VIEWER">VIEWER</option>
                              <option value="EDITOR">EDITOR</option>
                          </select>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50" onClick={() => handleRemoveMember(m.id.nguoiDungId)}>
                             <X className="w-5 h-5" />
                          </Button>
                       </div>
                    </div>
                   ))}
                </div>
               )}
            </div>
          </div>
           <div className="p-8 bg-slate-50 text-center">
              <Button variant="ghost" className="font-bold text-slate-400" onClick={() => setIsManageMembersOpen(false)}>ĐÓNG CỬA SỔ</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
