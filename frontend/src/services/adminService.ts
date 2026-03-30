import api from "./api";

// --- Thống kê ---
export const adminThongKeApi = {
  getTongQuan: () => api.get("/admin/thong-ke/tong-quan"),
};

// --- Nhật ký ---
export const adminNhatKyApi = {
  getPhanTrang: (page: number, size: number) => 
    api.get(`/admin/nhat-ky?page=${page}&size=${size}`),
};

// --- Quản lý Danh mục Hệ thống ---
export const adminDanhMucApi = {
  getAll: () => api.get("/admin/danh-muc-he-thong"),
  create: (data: any) => api.post("/admin/danh-muc-he-thong", data),
  update: (id: number, data: any) => api.put(`/admin/danh-muc-he-thong/${id}`, data),
  delete: (id: number) => api.delete(`/admin/danh-muc-he-thong/${id}`),
};

// --- Users Admin ---
export const adminUserApi = {
  doiVaiTro: (id: string, vaiTro: string) => 
    api.patch(`/nguoi-dung/${id}/vai-tro`, { vaiTro }),

  doiTrangThai: (id: string, trangThai: boolean) => 
    api.patch(`/nguoi-dung/${id}/trang-thai`, { trangThai }),

  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/nguoi-dung/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
