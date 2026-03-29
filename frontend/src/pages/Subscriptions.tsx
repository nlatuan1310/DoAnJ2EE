import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  CreditCard,
  Bell,
  CheckCircle2,
  X,
  ShieldCheck,
  RefreshCcw
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import subscriptionService from "@/services/subscriptionService";
import api, { getCurrentUserId } from "@/services/api";

// --- Types ---
interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  loai: string;
  icon: string;
}

interface ViTien {
  id: string;
  tenVi: string;
  soDu: number;
}

interface DangKyDichVu {
  id: string;
  tenDichVu: string;
  soTien: number;
  chuKyThanhToan: string;
  ngayThanhToanTiep: string;
  viTien: ViTien;
  danhMuc: DanhMuc;
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<DangKyDichVu[]>([]);
  const [upcoming, setUpcoming] = useState<DangKyDichVu[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [wallets, setWallets] = useState<ViTien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Hiển thị thông báo tạm thời nếu cần (trong thực tế nên dùng Toast)
  useEffect(() => {
    if (error) {
      console.error(error);
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<DangKyDichVu | null>(null);
  const [formData, setFormData] = useState({
    tenDichVu: "",
    soTien: "",
    chuKyThanhToan: "monthly",
    ngayThanhToanTiep: new Date().toISOString().split('T')[0],
    viId: "",
    danhMucId: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const uid = getCurrentUserId();
      const [subsRes, upcomingRes, catsRes, walletsRes] = await Promise.all([
        subscriptionService.getAll(uid),
        subscriptionService.getDueSoon(30), // Lấy sắp đến hạn trong 30 ngày
        api.get(`/danh-muc/nguoi-dung/${uid}/loai/chi`).then(res => res.data),
        api.get(`/vi-tien/nguoi-dung/${uid}`).then(res => res.data)
      ]);

      setSubscriptions(subsRes.data);
      setUpcoming(upcomingRes.data);
      setCategories(catsRes);
      setWallets(walletsRes);
      
      if (walletsRes.length > 0 && !formData.viId) setFormData(prev => ({ ...prev, viId: walletsRes[0].id }));
      if (catsRes && catsRes.length > 0 && !formData.danhMucId) setFormData(prev => ({ ...prev, danhMucId: catsRes[0].id.toString() }));

    } catch (err: any) {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        tenDichVu: formData.tenDichVu,
        soTien: parseFloat(formData.soTien),
        chuKyThanhToan: formData.chuKyThanhToan,
        ngayThanhToanTiep: formData.ngayThanhToanTiep,
      };

      if (editingSub) {
        await subscriptionService.update(editingSub.id, payload);
        setSuccess("Đã cập nhật dịch vụ!");
      } else {
        await subscriptionService.create(formData.viId, parseInt(formData.danhMucId), payload);
        setSuccess("Đã đăng ký dịch vụ mới!");
      }

      setIsModalOpen(false);
      setEditingSub(null);
      fetchInitialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError("Lỗi khi lưu dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận hủy đăng ký dịch vụ này?")) return;
    try {
      await subscriptionService.delete(id);
      setSuccess("Đã xóa đăng ký.");
      fetchInitialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError("Lỗi khi xóa.");
    }
  };

  const openAddModal = () => {
    setEditingSub(null);
    setFormData({
      tenDichVu: "",
      soTien: "",
      chuKyThanhToan: "monthly",
      ngayThanhToanTiep: new Date().toISOString().split('T')[0],
      viId: wallets[0]?.id || "",
      danhMucId: categories[0]?.id.toString() || "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sub: DangKyDichVu) => {
    setEditingSub(sub);
    setFormData({
      tenDichVu: sub.tenDichVu,
      soTien: sub.soTien.toString(),
      chuKyThanhToan: sub.chuKyThanhToan,
      ngayThanhToanTiep: sub.ngayThanhToanTiep,
      viId: sub.viTien?.id || "",
      danhMucId: sub.danhMuc?.id.toString() || "",
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8">
      
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-lg">
                 <RefreshCcw className="w-6 h-6" />
               </div>
               <h1 className="text-3xl font-black tracking-tight">Hóa đơn định kỳ</h1>
             </div>
             <p className="text-indigo-100 opacity-80 max-w-md font-medium text-sm">Quản lý các dịch vụ trả phí hàng tháng/năm một cách tự động.</p>
          </div>
          <Button 
            onClick={openAddModal} 
            className="bg-white text-indigo-600 hover:bg-slate-50 px-8 h-12 rounded-xl font-bold text-lg shadow-lg gap-2"
          >
            <Plus className="w-5 h-5 font-bold" /> Thêm dịch vụ
          </Button>
        </div>
      </div>

      {/* Grid Layout for Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Subscriptions List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              Dịch vụ đang hoạt động
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">
                {subscriptions.length}
              </Badge>
            </h2>
          </div>

          {subscriptions.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CreditCard className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium">Bạn chưa đăng ký dịch vụ định kỳ nào.</p>
              <Button variant="link" onClick={openAddModal} className="text-indigo-600 font-bold">Bắt đầu ngay</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] bg-white group overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl shadow-inner text-indigo-600">
                          {sub.danhMuc?.icon || "📺"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-lg">{sub.tenDichVu}</h3>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{sub.chuKyThanhToan === 'monthly' ? 'Hàng tháng' : 'Hàng năm'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(sub)} className="h-8 w-8 text-slate-300 hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} className="h-8 w-8 text-slate-300 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số tiền</p>
                        <p className="text-xl font-black text-slate-800">{new Intl.NumberFormat('vi-VN').format(sub.soTien)} <span className="text-xs font-medium text-slate-400">₫</span></p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiếp theo</p>
                        <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-sm">
                          <Calendar className="w-3.5 h-3.5" />
                          {sub.ngayThanhToanTiep}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Upcoming & Tips */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Card */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-3">
                <Bell className="w-5 h-5 text-indigo-600" />
                Sắp đến hạn
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              {upcoming.length === 0 ? (
                <div className="py-4 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-100 mx-auto mb-3" />
                  <p className="text-sm text-slate-400 font-medium">Không có hóa đơn nào sắp tới.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcoming.slice(0, 5).map((u) => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">
                          {u.danhMuc?.icon || "📺"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{u.tenDichVu}</p>
                          <p className="text-[10px] font-medium text-slate-400">{u.ngayThanhToanTiep}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-800">-{new Intl.NumberFormat('vi-VN').format(u.soTien)}₫</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Info */}
          <Card className="border-none shadow-sm rounded-[2.5rem] bg-indigo-50/50">
            <CardContent className="p-8 space-y-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Thanh toán tự động</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hệ thống sẽ tự động tạo giao dịch chi phí vào ngày thanh toán tiếp theo để bạn không bao giờ quên.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
               <h2 className="text-xl font-black tracking-tight">{editingSub ? "Chỉnh sửa" : "Đăng ký"} Dịch vụ</h2>
               <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Tên dịch vụ</label>
                <Input 
                  value={formData.tenDichVu}
                  onChange={(e) => setFormData({...formData, tenDichVu: e.target.value})}
                  className="h-12 px-4 font-bold text-slate-800 rounded-xl border-none bg-slate-50 focus:ring-4 focus:ring-indigo-50"
                  placeholder="Ví dụ: Netflix, Spotify, iCloud..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Số tiền thanh toán</label>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-indigo-300">₫</div>
                   <Input 
                     type="number" 
                     value={formData.soTien}
                     onChange={(e) => setFormData({...formData, soTien: e.target.value})}
                     className="h-16 pl-10 pr-6 font-black text-3xl text-slate-800 rounded-2xl border-none bg-slate-50 focus:ring-4 focus:ring-indigo-50"
                     placeholder="0"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Chu kỳ</label>
                  <select 
                    value={formData.chuKyThanhToan}
                    onChange={(e) => setFormData({...formData, chuKyThanhToan: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-100 appearance-none"
                  >
                    <option value="monthly">Hàng tháng</option>
                    <option value="yearly">Hàng năm</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ngày tiếp theo</label>
                  <Input 
                    type="date" 
                    value={formData.ngayThanhToanTiep}
                    onChange={(e) => setFormData({...formData, ngayThanhToanTiep: e.target.value})}
                    className="h-12 bg-slate-50 rounded-xl border-none font-bold text-sm text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Danh mục</label>
                  <select 
                    value={formData.danhMucId}
                    onChange={(e) => setFormData({...formData, danhMucId: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-100"
                  >
                    {categories.length > 0 ? (
                      categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.tenDanhMuc}</option>)
                    ) : (
                      <option value="">-- Vui lòng tạo danh mục chi trước --</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ví thanh toán</label>
                  <select 
                    value={formData.viId}
                    onChange={(e) => setFormData({...formData, viId: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none font-bold text-slate-800 text-sm focus:ring-2 focus:ring-indigo-100"
                  >
                    {wallets.length > 0 ? (
                      wallets.map(w => <option key={w.id} value={w.id}>{w.tenVi}</option>)
                    ) : (
                      <option value="">-- Vui lòng tạo ví trước --</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-slate-400"
              >
                Hủy
              </Button>
              <Button 
                onClick={handleCreateOrUpdate} 
                disabled={loading || !formData.tenDichVu || !formData.soTien || !formData.viId || !formData.danhMucId}
                className="flex-2 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-10 shadow-lg"
              >
                {loading ? "..." : editingSub ? "Cập nhật" : "Đăng ký ngay"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Toast Logic would go here - for now simple alert/error already handled */}
    </div>
  );
}
