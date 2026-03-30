import { useState, useEffect } from "react";
import { 
  Loader2, 
  FolderCog, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  FolderPlus,
  Utensils, 
  Car, 
  ShoppingCart, 
  Home, 
  Coffee, 
  Smartphone, 
  Briefcase, 
  Heart,
  LayoutGrid,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { adminDanhMucApi } from "@/services/adminService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ICON_OPTIONS = [
  { id: "Utensils", icon: Utensils, label: "Ăn uống" },
  { id: "Car", icon: Car, label: "Di chuyển" },
  { id: "ShoppingCart", icon: ShoppingCart, label: "Mua sắm" },
  { id: "Home", icon: Home, label: "Nhà cửa" },
  { id: "Coffee", icon: Coffee, label: "Giải trí" },
  { id: "Smartphone", icon: Smartphone, label: "Liên lạc" },
  { id: "Briefcase", icon: Briefcase, label: "Công việc" },
  { id: "Heart", icon: Heart, label: "Sức khỏe" },
];

const CategoryIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const option = ICON_OPTIONS.find((o) => o.id === iconName);
  const Icon = option ? option.icon : Utensils;
  return <Icon className={className || "w-4 h-4"} />;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "expense" | "income">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: null as number | null,
    tenDanhMuc: "",
    loai: "expense",
    icon: "Utensils",
    mauSac: "#6366f1"
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const resp = await adminDanhMucApi.getAll();
      setCategories(resp.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setFormData({ id: null, tenDanhMuc: "", loai: "expense", icon: "Utensils", mauSac: "#6366f1" });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setFormData({ id: cat.id, tenDanhMuc: cat.tenDanhMuc, loai: cat.loai, icon: cat.icon, mauSac: cat.mauSac });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await adminDanhMucApi.update(formData.id, formData);
      } else {
        await adminDanhMucApi.create(formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert("Lỗi lưu danh mục: " + err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục hệ thống: ${name}?`)) return;
    try {
      await adminDanhMucApi.delete(id);
      fetchCategories();
    } catch (err: any) {
      alert("Lỗi xóa danh mục: " + err.message);
    }
  };

  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.tenDanhMuc.toLowerCase().includes(search.toLowerCase());
    if (categoryFilter === "all") return matchesSearch;
    return matchesSearch && (c.loai === categoryFilter || (c.loai === "chi" && categoryFilter === "expense") || (c.loai === "thu" && categoryFilter === "income"));
  });

  return (
    <div className="space-y-8 p-1">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Danh mục Hệ thống</h1>
          <p className="text-sm text-slate-500 mt-1.5">
            Quản lý các danh mục thu chi cung cấp sẵn cho mọi người dùng
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <Input
              placeholder="Tìm kiếm danh mục..."
              className="pl-9 h-11 bg-white border-slate-200 rounded-xl text-sm focus:ring-violet-500/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center bg-slate-100/80 p-1 rounded-xl w-full sm:w-auto self-stretch">
            {[
              { key: "all" as const, label: "Tất cả" },
              { key: "income" as const, label: "Thu nhập" },
              { key: "expense" as const, label: "Chi tiêu" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setCategoryFilter(f.key)}
                className={`flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  categoryFilter === f.key
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-100 hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục
          </button>
        </div>
      </div>

      {/* Main Content - Card Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-4" />
          <p className="font-medium">Đang tải dữ liệu hệ thống...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
            <FolderPlus className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Không tìm thấy danh mục nào</h3>
          <p className="text-slate-500 mb-8 max-w-sm">
            Không có kết quả nào khớp với tìm kiếm của bạn. Hãy thử thay đổi từ khóa hoặc bộ lọc.
          </p>
          <Button onClick={() => {setSearch(""); setCategoryFilter("all");}} variant="outline" className="rounded-xl px-6">
            Xóa bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="group relative bg-white border border-slate-100 rounded-[28px] p-5 flex flex-col items-center text-center hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg ring-4 ring-slate-50/50 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: cat.mauSac }}
              >
                <CategoryIcon iconName={cat.icon} className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-2 line-clamp-1">
                {cat.tenDanhMuc}
              </h3>
              <Badge
                variant="outline"
                className={`text-[10px] px-2 py-0.5 h-5 border-0 uppercase tracking-widest font-black ${
                  cat.loai === "thu" || cat.loai === "income"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-rose-50 text-rose-500"
                }`}
              >
                {cat.loai === "thu" || cat.loai === "income" ? "Thu nhập" : "Chi tiêu"}
              </Badge>

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[28px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300">
                <button
                  onClick={() => openEditModal(cat)}
                  className="w-10 h-10 bg-white shadow-md border border-slate-200 rounded-xl text-slate-600 hover:text-violet-600 hover:border-violet-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.tenDanhMuc)}
                  className="w-10 h-10 bg-white shadow-md border border-slate-200 rounded-xl text-slate-600 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modern Modal Design */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            {/* Header */}
            <div className="px-8 py-8 border-b border-slate-50 bg-slate-50/30 relative">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center shadow-inner">
                  <FolderPlus className="w-7 h-7 text-violet-600" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {formData.id ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 font-medium italic">
                    Phân loại thu nhập và chi tiêu hệ thống chuyên nghiệp.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSave} className="p-8 space-y-7">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Tên danh mục quản trị
                </label>
                <Input
                  required
                  className="h-14 px-5 bg-slate-50 border-slate-200 rounded-2xl text-base font-semibold focus:bg-white focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:font-normal placeholder:text-slate-300"
                  placeholder="Ví dụ: Ăn uống, Lương, Mua sắm..."
                  value={formData.tenDanhMuc}
                  onChange={(e) => setFormData({ ...formData, tenDanhMuc: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ml-1">
                    Loại danh mục
                  </label>
                  <select
                    className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-violet-500/10 outline-none transition-all appearance-none cursor-pointer text-slate-800"
                    value={formData.loai}
                    onChange={(e) => setFormData({ ...formData, loai: e.target.value })}
                  >
                    <option value="expense">Chi tiêu</option>
                    <option value="income">Thu nhập</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-700 ml-1">
                    Màu sắc nhận diện
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="relative group shrink-0">
                      <input
                        type="color"
                        value={formData.mauSac}
                        onChange={(e) => setFormData({ ...formData, mauSac: e.target.value })}
                        className="w-14 h-14 p-1 border-2 border-slate-100 rounded-2xl cursor-pointer bg-white transition-all group-hover:border-violet-300 shadow-sm"
                      />
                    </div>
                    <Input
                      className="h-14 px-4 bg-slate-50 border-slate-200 rounded-xl text-xs font-black font-mono tracking-widest uppercase focus:bg-white focus:ring-4 focus:ring-violet-500/10 outline-none text-slate-600"
                      value={formData.mauSac}
                      onChange={(e) => setFormData({ ...formData, mauSac: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Icon Matrix */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-700 ml-1">
                  Lựa chọn biểu tượng đại diện
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                  {ICON_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: option.id })}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all duration-200 transform
                        ${formData.icon === option.id
                          ? "bg-violet-50 border-violet-500 text-violet-600 shadow-lg shadow-violet-50 -translate-y-1"
                          : "bg-white border-slate-50 hover:border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50"}
                      `}
                    >
                      <option.icon className={`h-7 w-7 mb-2 ${formData.icon === option.id ? "text-violet-600" : "text-slate-400"}`} />
                      <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 h-14 px-6 border-2 border-slate-100 text-slate-500 text-sm font-bold rounded-2xl hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-2 h-14 px-10 bg-violet-600 text-white text-sm font-black rounded-2xl hover:bg-violet-700 transition-all shadow-xl shadow-violet-100 hover:shadow-violet-200 active:scale-95 transform tracking-widest uppercase"
                >
                  {formData.id ? "Lưu thay đổi" : "Lưu danh mục ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
