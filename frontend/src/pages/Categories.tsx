import { useState, useEffect, useCallback } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Plus,
  LayoutGrid,
  TrendingUp,
  TrendingDown,
  Tags,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Utensils, 
  Car, 
  ShoppingCart, 
  Home, 
  Coffee, 
  Smartphone, 
  Briefcase, 
  Heart 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { danhMucApi, theTagApi, getCurrentUserId } from "@/services/api"

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

export default function Categories() {
  const [activeTab, setActiveTab] = useState<"categories" | "tags">("categories")
  const [categoryFilter, setCategoryFilter] = useState<"all" | "thu" | "chi">("all")
  const [searchTerm, setSearchTerm] = useState("")
  
  const [categories, setCategories] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [categoryForm, setCategoryForm] = useState({
    tenDanhMuc: "",
    loai: "chi",
    icon: "Utensils",
    mauSac: "#6366f1",
  })

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false)
  const [editingTag, setEditingTag] = useState<any>(null)
  const [tagForm, setTagForm] = useState({
    tenTag: "",
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const uid = getCurrentUserId()
      const [catsRes, tagsRes] = await Promise.all([
        danhMucApi.getAll(uid),
        theTagApi.getAll(uid)
      ])
      setCategories(catsRes.data || [])
      setTags(tagsRes.data || [])
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Summary counts
  const totalCategories = categories.length
  const incomeCategories = categories.filter(c => c.loai === "thu").length
  const expenseCategories = categories.filter(c => c.loai === "chi").length
  const totalTags = tags.length

  // Filtered lists
  const filteredCategories = categories.filter(c => {
    const matchesSearch = c.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
    if (categoryFilter === "all") return matchesSearch
    return matchesSearch && c.loai === categoryFilter
  })

  const filteredTags = tags.filter(t => 
    t.tenTag.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handlers
  const resetCategoryForm = () => {
    setCategoryForm({ tenDanhMuc: "", loai: "chi", icon: "Utensils", mauSac: "#6366f1" })
    setEditingCategory(null)
  }

  const resetTagForm = () => {
    setTagForm({ tenTag: "" })
    setEditingTag(null)
  }

  const handleCategorySubmit = async () => {
    try {
      if (editingCategory) {
        await danhMucApi.update(editingCategory.id, categoryForm)
      } else {
        await danhMucApi.create(categoryForm)
      }
      setIsCategoryDialogOpen(false)
      fetchData()
    } catch (err) {
      console.error("Lỗi lưu danh mục:", err)
    }
  }

  const handleTagSubmit = async () => {
    try {
      if (editingTag) {
        await theTagApi.update(editingTag.id, tagForm)
      } else {
        await theTagApi.create(tagForm)
      }
      setIsTagDialogOpen(false)
      fetchData()
    } catch (err) {
      console.error("Lỗi lưu thẻ:", err)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        await danhMucApi.delete(id)
        fetchData()
      } catch (err) {
        console.error("Lỗi xóa danh mục:", err)
      }
    }
  }

  const handleDeleteTag = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa thẻ này?")) {
      try {
        await theTagApi.delete(id)
        fetchData()
      } catch (err) {
        console.error("Lỗi xóa thẻ:", err)
      }
    }
  }

  const openEditCategory = (category: any) => {
    setEditingCategory(category)
    setCategoryForm({
      tenDanhMuc: category.tenDanhMuc,
      loai: category.loai,
      icon: category.icon,
      mauSac: category.mauSac,
    })
    setIsCategoryDialogOpen(true)
  }

  const openEditTag = (tag: any) => {
    setEditingTag(tag)
    setTagForm({ tenTag: tag.tenTag })
    setIsTagDialogOpen(true)
  }

  if (loading && categories.length === 0 && tags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">Cấu hình tài chính</h1>
          <p className="text-sm text-slate-500">Quản lý danh mục thu chi và nhãn gắn cho các giao dịch</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <button
            onClick={() => { resetCategoryForm(); setIsCategoryDialogOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white text-sm font-medium rounded-xl hover:bg-violet-600 transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" />
            Thêm Danh Mục
          </button>
          <button
            onClick={() => { resetTagForm(); setIsTagDialogOpen(true) }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-900 transition-all shadow-sm hover:shadow-md"
          >
            <Tags className="w-4 h-4" />
            Thêm Thẻ
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">TỔNG DANH MỤC</p>
                <p className="text-2xl font-bold text-slate-800">{totalCategories}</p>
                <p className="text-xs text-slate-400 mt-1">{incomeCategories} thu, {expenseCategories} chi</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <LayoutGrid className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">DANH MỤC THU</p>
                <p className="text-2xl font-bold text-slate-800">{incomeCategories}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">DANH MỤC CHI</p>
                <p className="text-2xl font-bold text-slate-800">{expenseCategories}</p>
              </div>
              <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-rose-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase font-semibold text-slate-400 tracking-wider mb-1">TỔNG THẺ (TAGS)</p>
                <p className="text-2xl font-bold text-slate-800">{totalTags}</p>
              </div>
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                <Tags className="w-6 h-6 text-violet-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main List Section */}
      <Card className="bg-white border-slate-200 shadow-xs rounded-xl overflow-hidden border">
        <CardHeader className="px-5 pt-5 pb-4 border-b border-slate-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <CardTitle className="text-base font-semibold text-slate-800">Cấu Hình Dữ Liệu</CardTitle>
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                {[
                  { key: "categories" as const, label: "Danh Mục", count: totalCategories },
                  { key: "tags" as const, label: "Thẻ", count: totalTags },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === t.key
                        ? "bg-white text-slate-800 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {t.label}
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                      activeTab === t.key ? "bg-violet-100 text-violet-600" : "bg-slate-200 text-slate-500"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm..."
                  className="pl-8 h-9 w-[200px] border-slate-200 rounded-lg text-xs"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {activeTab === "categories" && (
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
                  {[
                    { key: "all" as const, label: "Tất cả" },
                    { key: "thu" as const, label: "Thu nhập" },
                    { key: "chi" as const, label: "Chi tiêu" },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCategoryFilter(f.key)}
                      className={`px-3 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                        categoryFilter === f.key
                          ? "bg-white text-slate-800 shadow-xs"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-5 py-6">
          {activeTab === "categories" ? (
            filteredCategories.length === 0 ? (
              <EmptyState title="Không tìm thấy danh mục" description="Hãy thêm danh mục mới để bắt đầu quản lý tài chính." onClick={() => { resetCategoryForm(); setIsCategoryDialogOpen(true) }} />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredCategories.map((item) => (
                  <div 
                    key={item.id}
                    className="group relative bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center text-center hover:border-violet-200 hover:shadow-sm transition-all"
                  >
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3 shadow-sm ring-4 ring-slate-50/50" 
                      style={{ backgroundColor: item.mauSac }}
                    >
                      <CategoryIcon iconName={item.icon} className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700 mb-1 line-clamp-1">{item.tenDanhMuc}</p>
                    <Badge variant={item.loai === "thu" ? "secondary" : "destructive"} className={`text-[10px] px-1.5 py-0 h-4 border-0 ${item.loai === "thu" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                      {item.loai === "thu" ? "Thu nhập" : "Chi tiêu"}
                    </Badge>

                    {/* Quick Actions */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditCategory(item)} className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-violet-600 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDeleteCategory(item.id)} className="p-1.5 bg-white shadow-sm border border-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            filteredTags.length === 0 ? (
              <EmptyState title="Chưa có thẻ nào" description="Ghi chú thêm thông tin cho các giao dịch bằng thẻ nhãn." onClick={() => { resetTagForm(); setIsTagDialogOpen(true) }} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {filteredTags.map((tag) => (
                  <div 
                    key={tag.id}
                    className="group flex items-center gap-3 bg-white border border-slate-200 pl-4 pr-2 py-2 rounded-xl hover:border-violet-300 hover:bg-violet-50 transition-all shadow-xs"
                  >
                    <span className="text-sm font-medium text-slate-700">{tag.tenTag}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditTag(tag)} className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDeleteTag(tag.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      {/* === Category Dialog === */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-[24px] p-0 overflow-hidden border-0 bg-white shadow-2xl">
          <div className="bg-slate-50/80 px-6 py-6 border-b border-slate-100">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-violet-600" />
                </div>
                {editingCategory ? "Cập Nhật Danh Mục" : "Thêm Danh Mục Mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1.5 ml-1">
                Phân loại thu nhập và chi tiêu giúp bạn quản lý tiền tốt hơn.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-6 space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="tenDanhMuc" className="text-sm font-bold text-slate-700 ml-1">Tên danh mục</Label>
              <Input
                id="tenDanhMuc"
                placeholder="Ví dụ: Ăn uống, Lương, Mua sắm..."
                className="h-12 rounded-xl border-slate-200 focus:border-violet-500 focus:ring-violet-500 bg-white font-medium text-slate-900"
                value={categoryForm.tenDanhMuc}
                onChange={(e) => setCategoryForm({ ...categoryForm, tenDanhMuc: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2.5">
                <Label htmlFor="loai" className="text-sm font-bold text-slate-700 ml-1">Loại danh mục</Label>
                <select
                  id="loai"
                  className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all font-semibold text-slate-800"
                  value={categoryForm.loai}
                  onChange={(e) => setCategoryForm({ ...categoryForm, loai: e.target.value })}
                >
                  <option value="chi">Chi tiêu</option>
                  <option value="thu">Thu nhập</option>
                </select>
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="mauSac" className="text-sm font-bold text-slate-700 ml-1">Màu sắc hiển thị</Label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <input
                      type="color"
                      id="mauSac"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      value={categoryForm.mauSac}
                      onChange={(e) => setCategoryForm({ ...categoryForm, mauSac: e.target.value })}
                    />
                    <div 
                      className="w-full h-full rounded-xl border-2 border-slate-100 shadow-sm" 
                      style={{ backgroundColor: categoryForm.mauSac }}
                    />
                  </div>
                  <Input 
                    value={categoryForm.mauSac} 
                    onChange={(e) => setCategoryForm({ ...categoryForm, mauSac: e.target.value })}
                    className="h-12 rounded-xl font-mono text-xs uppercase bg-white border-slate-200"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 ml-1">Lựa chọn biểu tượng</Label>
              <div className="grid grid-cols-4 gap-2">
                {ICON_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCategoryForm({ ...categoryForm, icon: option.id })}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all
                      ${categoryForm.icon === option.id 
                        ? "bg-violet-50 border-violet-500 text-violet-600 shadow-sm" 
                        : "bg-white border-slate-50 hover:border-slate-200 text-slate-400 hover:text-slate-600"}
                    `}
                  >
                    <option.icon className={`h-6 w-6 mb-1.5 ${categoryForm.icon === option.id ? "text-violet-600" : "text-slate-400"}`} />
                    <span className="text-[10px] font-bold leading-tight">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsCategoryDialogOpen(false)} 
              className="rounded-xl text-slate-500 font-bold px-5"
            >
              Hủy
            </Button>
            <Button 
              type="button" 
              className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-violet-100 transition-all hover:-translate-y-0.5" 
              onClick={handleCategorySubmit}
            >
              {editingCategory ? "Lưu thay đổi" : "Lưu danh mục"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* === Tag Dialog === */}
      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-[24px] p-0 overflow-hidden border-0 bg-white shadow-2xl">
          <div className="bg-slate-50/80 px-6 py-6 border-b border-slate-100">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Tags className="w-5 h-5 text-emerald-600" />
                </div>
                {editingTag ? "Cập Nhật Thẻ" : "Thêm Thẻ Mới"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm mt-1.5 ml-1">
                Gắn nhãn để tìm kiếm và lọc giao dịch nhanh hơn.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="px-6 py-8">
            <div className="space-y-2.5">
              <Label htmlFor="tenTag" className="text-sm font-bold text-slate-700 ml-1">Tên nhãn dán</Label>
              <Input
                id="tenTag"
                placeholder="Ví dụ: Quan trọng, Du lịch..."
                className="rounded-xl border-slate-200 h-14 bg-white text-slate-900 font-semibold px-4 focus:ring-emerald-500 focus:border-emerald-500"
                value={tagForm.tenTag}
                onChange={(e) => setTagForm({ ...tagForm, tenTag: e.target.value })}
              />
            </div>
          </div>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsTagDialogOpen(false)} 
              className="rounded-xl text-slate-500 font-bold px-5"
            >
              Hủy
            </Button>
            <Button 
              type="button" 
              className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-slate-200 transition-all hover:-translate-y-0.5" 
              onClick={handleTagSubmit}
            >
              {editingTag ? "Cập nhật" : "Lưu thẻ ngay"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-slate-100">
        <LayoutGrid className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-[250px]">{description}</p>
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 px-5 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-xl hover:bg-violet-600 transition-all shadow-sm"
      >
        <Plus className="w-4 h-4" /> Bắt đầu ngay
      </button>
    </div>
  )
}
