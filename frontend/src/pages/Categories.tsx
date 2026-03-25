import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { danhMucApi, theTagApi } from "@/services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  Pencil, 
  Search, 
  Utensils, 
  Car, 
  ShoppingCart, 
  Home, 
  Coffee, 
  Smartphone, 
  Briefcase, 
  Heart 
} from "lucide-react";

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
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("categories");
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for Category Dialog
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    tenDanhMuc: "",
    loai: "chi", // Default type
    icon: "Utensils",
    mauSac: "#6366f1", // Default color
  });

  // States for Tag Dialog
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [tagForm, setTagForm] = useState({
    tenTag: "",
  });

  // Queries
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => danhMucApi.getAll().then((res) => res.data),
  });

  const tagsQuery = useQuery({
    queryKey: ["tags"],
    queryFn: () => theTagApi.getAll().then((res) => res.data),
  });

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data: any) => danhMucApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => danhMucApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setIsCategoryDialogOpen(false);
      resetCategoryForm();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => danhMucApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  // Tag Mutations
  const createTagMutation = useMutation({
    mutationFn: (data: any) => theTagApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsTagDialogOpen(false);
      resetTagForm();
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => theTagApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      setIsTagDialogOpen(false);
      resetTagForm();
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: (id: number) => theTagApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });

  // Form Handlers
  const resetCategoryForm = () => {
    setCategoryForm({ tenDanhMuc: "", loai: "chi", icon: "Utensils", mauSac: "#6366f1" });
    setEditingCategory(null);
  };

  const resetTagForm = () => {
    setTagForm({ tenTag: "" });
    setEditingTag(null);
  };

  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleTagSubmit = () => {
    if (editingTag) {
      updateTagMutation.mutate({ id: editingTag.id, data: tagForm });
    } else {
      createTagMutation.mutate(tagForm);
    }
  };

  const openEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryForm({
      tenDanhMuc: category.tenDanhMuc,
      loai: category.loai,
      icon: category.icon,
      mauSac: category.mauSac,
    });
    setIsCategoryDialogOpen(true);
  };

  const openEditTag = (tag: any) => {
    setEditingTag(tag);
    setTagForm({ tenTag: tag.tenTag });
    setIsTagDialogOpen(true);
  };

  // Filter lists
  const filteredCategories = categoriesQuery.data?.filter((c: any) => 
    c.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTags = tagsQuery.data?.filter((t: any) => 
    t.tenTag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cấu hình tài chính</h1>
          <p className="text-slate-500 text-sm">Quản lý danh mục thu chi và nhãn gắn cho các giao dịch.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm..."
              className="pl-9 w-[200px] sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {activeTab === "categories" ? (
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger>
                <Button onClick={resetCategoryForm} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Thêm danh mục
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? "Cập nhật danh mục" : "Thêm danh mục mới"}</DialogTitle>
                  <DialogDescription>
                    Danh mục giúp bạn phân loại các khoản thu nhập và chi tiêu.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tenDanhMuc">Tên danh mục</Label>
                    <Input
                      id="tenDanhMuc"
                      value={categoryForm.tenDanhMuc}
                      onChange={(e) => setCategoryForm({ ...categoryForm, tenDanhMuc: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="loai">Loại</Label>
                      <select
                        id="loai"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        value={categoryForm.loai}
                        onChange={(e) => setCategoryForm({ ...categoryForm, loai: e.target.value })}
                      >
                        <option value="chi">Chi tiêu</option>
                        <option value="thu">Thu nhập</option>
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="mauSac">Màu sắc</Label>
                      <input
                        type="color"
                        id="mauSac"
                        className="w-full h-10 rounded-md border border-slate-200 cursor-pointer"
                        value={categoryForm.mauSac}
                        onChange={(e) => setCategoryForm({ ...categoryForm, mauSac: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Biểu tượng (Icon)</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {ICON_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setCategoryForm({ ...categoryForm, icon: option.id })}
                          className={`flex flex-col items-center justify-center p-2 rounded-md border border-slate-100 transition-colors
                            ${categoryForm.icon === option.id ? "bg-violet-50 border-violet-200 text-violet-600" : "hover:bg-slate-50"}
                          `}
                        >
                          <option.icon className="h-5 w-5 mb-1" />
                          <span className="text-[10px]">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>Hủy</Button>
                  <Button type="button" className="bg-violet-600" onClick={handleCategorySubmit}>
                    {editingCategory ? "Lưu thay đổi" : "Lưu danh mục"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger>
                <Button onClick={resetTagForm} className="bg-violet-600 hover:bg-violet-700">
                  <Plus className="w-4 h-4 mr-2" /> Thêm thẻ
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingTag ? "Cập nhật thẻ" : "Thêm thẻ mới"}</DialogTitle>
                  <DialogDescription>
                    Dùng thẻ để đánh dấu chi tiết hơn cho các giao dịch.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="tenTag">Tên thẻ</Label>
                    <Input
                      id="tenTag"
                      value={tagForm.tenTag}
                      onChange={(e) => setTagForm({ ...tagForm, tenTag: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsTagDialogOpen(false)}>Hủy</Button>
                  <Button type="button" className="bg-violet-600" onClick={handleTagSubmit}>
                    {editingTag ? "Lưu thay đổi" : "Lưu thẻ"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border p-1 rounded-md shadow-sm">
          <TabsTrigger value="categories" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-600">
            Danh mục
          </TabsTrigger>
          <TabsTrigger value="tags" className="data-[state=active]:bg-violet-50 data-[state=active]:text-violet-600">
            Thẻ (Tags)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Danh sách danh mục</CardTitle>
              <CardDescription>
                Tổng cộng {categoriesQuery.data?.length || 0} danh mục đang có trong hệ thống.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoriesQuery.isLoading ? (
                <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">Icon</TableHead>
                      <TableHead>Tên danh mục</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Màu sắc</TableHead>
                      <TableHead className="text-right">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories?.map((item: any) => (
                      <TableRow key={item.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white" 
                            style={{ backgroundColor: item.mauSac }}
                          >
                            <CategoryIcon iconName={item.icon} className="w-5 h-5" />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-slate-700">{item.tenDanhMuc}</TableCell>
                        <TableCell>
                          <Badge variant={item.loai === "thu" ? "secondary" : "destructive"} className={item.loai === "thu" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : "bg-rose-50 text-rose-700 hover:bg-rose-50"}>
                            {item.loai === "thu" ? "Thu nhập" : "Chi tiêu"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: item.mauSac }} />
                            <span className="text-xs text-slate-500 font-mono">{item.mauSac}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-violet-600" onClick={() => openEditCategory(item)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-rose-600" onClick={() => deleteCategoryMutation.mutate(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!filteredCategories || filteredCategories.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-slate-400">Không tìm thấy danh mục nào.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tags">
          <Card className="bg-white border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Danh sách thẻ</CardTitle>
              <CardDescription>
                Ghi chú thêm thông tin cho các giao dịch bằng thẻ nhãn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tagsQuery.isLoading ? (
                <div className="text-center py-10 text-slate-500">Đang tải dữ liệu...</div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {filteredTags?.map((tag: any) => (
                    <div 
                      key={tag.id} 
                      className="group flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition-all"
                    >
                      <span className="text-slate-700 font-medium">{tag.tenTag}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditTag(tag)} className="text-slate-400 hover:text-violet-600">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button onClick={() => deleteTagMutation.mutate(tag.id)} className="text-slate-400 hover:text-rose-600">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!filteredTags || filteredTags.length === 0) && (
                    <div className="w-full text-center py-10 text-slate-400">Không tìm thấy thẻ nào.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
