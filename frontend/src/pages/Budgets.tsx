import { useState, useEffect } from "react";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Wallet,
  ChevronRight,
  Info
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// --- Types ---
interface DanhMuc {
  id: number;
  ten: string;
  loai: string;
  bieuTuong: string;
}

interface ViTien {
  id: string;
  tenVi: string;
  soDu: number;
}

interface NganSach {
  id?: string;
  nguoiDung?: any;
  viTien?: ViTien;
  danhMuc?: DanhMuc;
  gioiHanTien: number;
  chuKy: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  spent?: number;
}

import api, { getCurrentUserId } from "@/services/api";

export default function Budgets() {
  const [budgets, setBudgets] = useState<NganSach[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [wallets, setWallets] = useState<ViTien[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<NganSach | null>(null);
  const [formData, setFormData] = useState({
    viId: "",
    danhMucId: "",
    gioiHanTien: "",
    chuKy: "monthly",
    ngayBatDau: new Date().toISOString().split('T')[0],
    ngayKetThuc: "",
  });

  // Create Category Modal State
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (formData.ngayBatDau && formData.chuKy !== 'custom') {
      const start = new Date(formData.ngayBatDau);
      const end = new Date(start);
      if (formData.chuKy === 'weekly') {
        end.setDate(start.getDate() + 6); // 7 days inclusive
      } else if (formData.chuKy === 'monthly') {
        end.setMonth(start.getMonth() + 1);
        end.setDate(start.getDate() - 1); // 1 month - 1 day (inclusive)
      }
      setFormData(prev => ({ ...prev, ngayKetThuc: end.toISOString().split('T')[0] }));
    }
  }, [formData.ngayBatDau, formData.chuKy]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [budgetsRes, catsRes, walletsRes, txRes] = await Promise.all([
        api.get(`/ngan-sach/nguoi-dung/${getCurrentUserId()}`),
        api.get(`/danh-muc/nguoi-dung/${getCurrentUserId()}/loai/expense`),
        api.get(`/vi-tien/nguoi-dung/${getCurrentUserId()}`),
        api.get(`/giao-dich/nguoi-dung/${getCurrentUserId()}`)
      ]);

      const budgetsData = budgetsRes.data;
      const catsData = catsRes.data;
      const walletsData = walletsRes.data;
      const txData = txRes.data;

      const enrichedBudgets = budgetsData.map((b: NganSach) => {
        const spent = txData
          .filter((tx: any) => {
            const txDateStr = new Date(tx.ngayGiaoDich).toISOString().split('T')[0];
            const isCorrectCategory = tx.danhMuc?.id === b.danhMuc?.id;
            const isInDateRange = txDateStr >= b.ngayBatDau && txDateStr <= b.ngayKetThuc;
            const isCorrectWallet = b.viTien?.id ? tx.viTien?.id === b.viTien.id : true;
            
            return tx.loai === "expense" && isCorrectCategory && isInDateRange && isCorrectWallet;
          })
          .reduce((sum: number, tx: any) => sum + tx.soTien, 0);
        return { ...b, spent };
      });

      setBudgets(enrichedBudgets);
      setCategories(catsData);
      setWallets(walletsData);
      
      if (walletsData.length > 0 && !formData.viId) setFormData(prev => ({ ...prev, viId: walletsData[0].id }));
      if (catsData.length > 0 && !formData.danhMucId) setFormData(prev => ({ ...prev, danhMucId: catsData[0].id.toString() }));

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      const isEditing = !!editingBudget;
      const url = isEditing 
        ? `/ngan-sach/${editingBudget.id}` 
        : `/ngan-sach?nguoiDungId=${getCurrentUserId()}&viId=${formData.viId}&danhMucId=${formData.danhMucId}`;
      
      const body = {
        gioiHanTien: parseFloat(formData.gioiHanTien),
        chuKy: formData.chuKy,
        ngayBatDau: formData.ngayBatDau,
        ngayKetThuc: formData.ngayKetThuc
      };

      if (isEditing) {
        await api.put(url, body);
      } else {
        await api.post(url, body);
      }

      setSuccess(isEditing ? "Đã cập nhật!" : "Đã tạo mới!");
      setIsModalOpen(false);
      setEditingBudget(null);
      fetchInitialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const res = await api.post(`/danh-muc/nguoi-dung/${getCurrentUserId()}`, {
        tenDanhMuc: newCategoryName.trim(),
        loai: "expense",
        icon: "",
        mauSac: ""
      });
      const newCat = res.data;
      
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, danhMucId: newCat.id.toString() }));
      
      setSuccess("Đã tạo danh mục mới!");
      setIsCreateCategoryOpen(false);
      setNewCategoryName("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xác nhận xóa?")) return;
    try {
      await api.delete(`/ngan-sach/${id}`);
      setSuccess("Đã xóa.");
      fetchInitialData();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const openAddModal = () => {
    setEditingBudget(null);
    setFormData({
      viId: wallets[0]?.id || "",
      danhMucId: categories[0]?.id.toString() || "",
      gioiHanTien: "",
      chuKy: "monthly",
      ngayBatDau: new Date().toISOString().split('T')[0],
      ngayKetThuc: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (budget: NganSach) => {
    setEditingBudget(budget);
    setFormData({
      viId: budget.viTien?.id || "",
      danhMucId: budget.danhMuc?.id.toString() || "",
      gioiHanTien: budget.gioiHanTien.toString(),
      chuKy: budget.chuKy,
      ngayBatDau: budget.ngayBatDau,
      ngayKetThuc: budget.ngayKetThuc,
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-500 space-y-8">
      
      {/* Notifications */}
      {(success || error) && (
        <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all animate-in slide-in-from-right
          ${success ? "bg-emerald-500" : "bg-rose-500"}`}>
          {success || error}
          <button onClick={() => { setSuccess(null); setError(null); }} className="hover:opacity-70 transition-opacity">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-100">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
             <h1 className="text-3xl font-black tracking-tight">Kế hoạch Ngân sách</h1>
             <p className="text-indigo-100 opacity-80 max-w-md font-medium text-sm">Thiết lập giới hạn chi tiêu thông minh để kiểm soát tài chính.</p>
          </div>
          <Button 
            onClick={openAddModal} 
            className="bg-white text-indigo-600 hover:bg-slate-50 px-8 h-12 rounded-xl font-bold text-lg shadow-lg gap-2"
          >
            <Plus className="w-5 h-5 font-bold" /> Tạo mới
          </Button>
        </div>
      </div>

      {/* Stats Summary - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng giới hạn", value: budgets.reduce((s, b) => s + b.gioiHanTien, 0), color: "indigo" },
          { label: "Đã chi tiêu", value: budgets.reduce((s, b) => s + (b.spent || 0), 0), color: "rose" },
          { label: "Số dư khả dụng", value: budgets.reduce((s, b) => s + (b.gioiHanTien - (b.spent || 0)), 0), color: "emerald" },
          { label: "Danh mục", value: budgets.length, color: "amber", isCount: true }
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm rounded-2xl bg-white">
            <CardContent className="p-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="text-xl font-black text-slate-800">
                {stat.isCount ? stat.value : new Intl.NumberFormat('vi-VN').format(stat.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Budget List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Chi tiết ngân sách</h2>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
             <Button variant="outline" size="sm" className="rounded-lg shadow-sm text-xs font-bold px-4">Lưới</Button>
             <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold text-slate-400 px-4">Danh sách</Button>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem]">
            <p className="text-slate-400 font-medium">Bạn chưa thiết lập ngân sách nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b) => {
              const spent = b.spent || 0;
              const progress = Math.min((spent / b.gioiHanTien) * 100, 100);
              const isDanger = progress >= 100;
              const isWarning = progress > 80;

              return (
                <Card key={b.id} className="border-none shadow-sm hover:shadow-lg transition-all rounded-[2rem] bg-white group overflow-hidden">
                  <CardHeader className="p-7 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner
                          ${isDanger ? 'bg-rose-50 text-rose-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                          {b.danhMuc?.bieuTuong || "💼"}
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg font-bold text-slate-800 truncate tracking-tight">{b.danhMuc?.ten}</CardTitle>
                          <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-lg bg-slate-50 text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                             {b.viTien?.tenVi}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <Button variant="ghost" size="icon" onClick={() => openEditModal(b)} className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id!)} className="h-8 w-8 text-slate-400 hover:text-rose-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-7 pt-0 space-y-6">
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-end text-xs font-bold">
                        <p className={`text-xl font-black ${isDanger ? 'text-rose-600' : 'text-slate-800'}`}>
                          {new Intl.NumberFormat('vi-VN').format(spent)}
                        </p>
                        <p className="text-slate-400">/ {new Intl.NumberFormat('vi-VN').format(b.gioiHanTien)}</p>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full bg-slate-50 border-none shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000
                            ${isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-indigo-600'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </Progress>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                       <span>{b.ngayBatDau} - {b.ngayKetThuc}</span>
                       <span className={`px-2 py-0.5 rounded-md ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                         {b.chuKy === 'monthly' ? 'Tháng' : b.chuKy === 'weekly' ? 'Tuần' : 'Tùy chỉnh'}
                       </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* PREMIUM CENTERED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Glassmorphism Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-all" 
            onClick={() => setIsModalOpen(false)} 
          />
          
          <div className="relative bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 border border-white/20">
            {/* Elegant Header with Gradient */}
            <div className="relative p-8 text-white overflow-hidden"
                 style={{ background: "linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)" }}>
               <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
               <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none" />
               
               <div className="relative flex items-center justify-between">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner">
                     <Plus className="w-6 h-6 text-white" />
                   </div>
                   <div>
                     <h2 className="text-2xl font-black tracking-tight leading-none">
                       {editingBudget ? "Sửa Ngân sách" : "Tạo Ngân sách"}
                     </h2>
                     <p className="text-indigo-200/80 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
                       Thiết lập mục tiêu chi tiêu
                     </p>
                   </div>
                 </div>
                 <button 
                   onClick={() => setIsModalOpen(false)} 
                   className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:rotate-90 duration-300"
                 >
                   <X className="w-5 h-5" />
                 </button>
               </div>
            </div>

            {/* Modal Body - Premium Experience */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-white/50 backdrop-blur-sm">
              
              {/* Category & Wallet Row */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Danh mục</label>
                    <button 
                      type="button" 
                      onClick={() => setIsCreateCategoryOpen(true)} 
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Tạo mới
                    </button>
                  </div>
                  <div className="relative">
                    <select 
                      value={formData.danhMucId}
                      onChange={(e) => setFormData({...formData, danhMucId: e.target.value})}
                      disabled={!!editingBudget}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl bg-slate-50/80 border border-slate-100 font-bold text-slate-700 text-sm focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none appearance-none transition-all disabled:opacity-50"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.ten}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Info className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nguồn tiền (Ví)</label>
                  <div className="relative">
                    <select 
                      value={formData.viId}
                      onChange={(e) => setFormData({...formData, viId: e.target.value})}
                      disabled={!!editingBudget}
                      className="w-full h-12 pl-4 pr-10 rounded-2xl bg-slate-50/80 border border-slate-100 font-bold text-slate-700 text-sm focus:ring-4 focus:ring-indigo-50 focus:bg-white outline-none appearance-none transition-all disabled:opacity-50"
                    >
                      {wallets.map(w => <option key={w.id} value={w.id}>{w.tenVi}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Section - The "Hero" Input */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hạn mức tối đa</label>
                <div className="group relative">
                   <div className="absolute left-6 top-1/2 -translate-y-1/2 text-3xl font-black text-indigo-500/20 group-focus-within:text-indigo-500/40 transition-colors italic">₫</div>
                   <input 
                     type="number" 
                     value={formData.gioiHanTien}
                     onChange={(e) => setFormData({...formData, gioiHanTien: e.target.value})}
                     className="w-full h-24 pl-14 pr-8 font-black text-5xl text-slate-800 rounded-[2rem] border-2 border-slate-50 bg-slate-50/50 focus:ring-8 focus:ring-indigo-50/50 focus:bg-white focus:border-indigo-100 transition-all placeholder:text-slate-200 outline-none"
                     placeholder="0"
                   />
                   <div className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-slate-300 uppercase tracking-tighter">VNĐ</div>
                </div>
              </div>

              {/* Period Selection - Modern Segmented Control */}
              <div className="space-y-4 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Kỳ hạn ngân sách</label>
                <div className="grid grid-cols-3 gap-3 p-1.5 bg-slate-50/80 rounded-[1.5rem] border border-slate-100">
                  {['weekly', 'monthly', 'custom'].map(id => (
                    <button
                      key={id}
                      onClick={() => setFormData({...formData, chuKy: id})}
                      className={`h-12 rounded-2xl font-black text-xs transition-all duration-300
                        ${formData.chuKy === id 
                          ? 'bg-white text-indigo-700 shadow-xl shadow-indigo-100/50 scale-[1.02]' 
                          : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                    >
                      {id === 'weekly' ? 'Hàng Tuần' : id === 'monthly' ? 'Hàng Tháng' : 'Tùy chỉnh'}
                    </button>
                  ))}
                </div>

                {/* Date Selection Box */}
                <div className="p-6 bg-indigo-50/30 rounded-[2rem] border border-indigo-100/50 flex gap-6 items-center">
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em] px-1">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      value={formData.ngayBatDau}
                      onChange={(e) => setFormData({...formData, ngayBatDau: e.target.value})}
                      className="w-full h-11 bg-white rounded-xl border border-indigo-100 px-4 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200/50"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100/50 flex items-center justify-center shrink-0 mt-6">
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.15em] px-1">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      value={formData.ngayKetThuc}
                      onChange={(e) => setFormData({...formData, ngayKetThuc: e.target.value})}
                      disabled={formData.chuKy !== 'custom'}
                      className="w-full h-11 bg-white rounded-xl border border-indigo-100 px-4 font-bold text-sm text-slate-700 outline-none focus:ring-2 focus:ring-indigo-200/50 disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Footer - Large and Confident */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex gap-4">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-14 rounded-2xl font-black text-xs text-slate-400 hover:bg-slate-100 transition-all uppercase tracking-widest"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreateOrUpdate} 
                disabled={loading || !formData.gioiHanTien || !formData.ngayKetThuc}
                className="flex-[2] h-14 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 text-white rounded-2xl font-black text-sm shadow-2xl shadow-indigo-100 transition-all px-8 disabled:opacity-50 disabled:grayscale disabled:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  editingBudget ? "Lưu thay đổi" : "Kích hoạt Ngân sách"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL: TẠO DANH MỤC */}
      {isCreateCategoryOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCreateCategoryOpen(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-white flex items-center justify-between"
                 style={{ background: "linear-gradient(135deg, #4f46e5, #3730a3)" }}>
               <h2 className="text-xl font-black tracking-tight">Tạo Danh mục</h2>
               <button onClick={() => setIsCreateCategoryOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                 <X className="w-4 h-4" />
               </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tên danh mục mới</label>
                <input 
                  placeholder="Ăn uống, Di chuyển..." 
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full h-12 px-5 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                  autoFocus
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex gap-3 text-center">
              <button 
                onClick={() => setIsCreateCategoryOpen(false)}
                className="flex-1 h-12 rounded-xl font-bold text-xs text-slate-400 hover:bg-slate-100 transition-all"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateCategory} 
                disabled={creatingCategory || !newCategoryName.trim()}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {creatingCategory ? "..." : "Tạo ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
