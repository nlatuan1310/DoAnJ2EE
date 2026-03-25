import api, { getCurrentUserId } from './api';

// ===== VI TIEN API =====

export const viTienApi = {
  /** Lấy tất cả ví của người dùng hiện tại */
  getAll: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/vi-tien/nguoi-dung/${uid}`);
  },

  /** Lấy TẤT CẢ ví có thể truy cập (ví của mình + ví được chia sẻ) */
  getAllAccessible: async (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    const [ownedRes, sharedRes] = await Promise.all([
      api.get(`/vi-tien/nguoi-dung/${uid}`),
      api.get(`/thanh-vien-vi/nguoi-dung/${uid}`)
    ]);
    const owned = ownedRes.data || [];
    const shared = (sharedRes.data || [])
      .filter((m: any) => m.vaiTro !== 'owner')
      .map((m: any) => m.viTien);
    
    // Gộp và loại bỏ trùng lặp (nếu có)
    const all = [...owned, ...shared];
    const unique = Array.from(new Map(all.map(w => [w.id, w])).values());
    return { data: unique };
  },

  /** Lấy ví theo ID */
  getById: (viId: string) => api.get(`/vi-tien/${viId}`),

  /** Tạo ví mới */
  create: (data: { tenVi: string; tienTe: string; soDu?: number }, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/vi-tien/nguoi-dung/${uid}`, data);
  },

  /** Cập nhật ví */
  update: (viId: string, data: { tenVi?: string; tienTe?: string }) =>
    api.put(`/vi-tien/${viId}`, data),

  /** Xóa ví */
  delete: (viId: string) => api.delete(`/vi-tien/${viId}`),
};

// ===== THANH VIEN VI API =====

export const thanhVienViApi = {
  /** Lấy danh sách thành viên của một ví */
  getMembers: (viId: string) => api.get(`/thanh-vien-vi/${viId}`),

  /** Lấy danh sách ví mà người dùng tham gia */
  getSharedWallets: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/thanh-vien-vi/nguoi-dung/${uid}`);
  },

  /** Thêm thành viên vào ví bằng ID */
  addMember: (viId: string, nguoiDungId: string, vaiTro: string) =>
    api.post(`/thanh-vien-vi/${viId}/them`, null, {
      params: { nguoiDungId, vaiTro },
    }),

  /** Xóa thành viên khỏi ví */
  removeMember: (viId: string, nguoiDungId: string) =>
    api.delete(`/thanh-vien-vi/${viId}/xoa/${nguoiDungId}`),
};

// ===== NGUOI DUNG API (tìm kiếm để mời) =====

export const nguoiDungSearchApi = {
  /** Tìm người dùng theo email (để mời vào ví) */
  timTheoEmail: (email: string) => api.get(`/nguoi-dung/email/${email}`),
};
