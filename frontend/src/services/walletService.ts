import api from "./api";

export interface Wallet {
  id: string;
  tenVi: string;
  chuSoHuuId?: string;
  tienTe: string;
  soDu: number;
  ngayTao: string;
  vaiTro: "OWNER" | "EDITOR" | "VIEWER";
  tenChuSoHuu?: string;
  soThanhVien?: number;
  nhom?: boolean;
  role?: string; // added manually from membership
}

export interface WalletMember {
  id: {
    viId: string;
    nguoiDungId: string;
  };
  vaiTro: string;
  nguoiDung?: {
    id: string;
    hoVaTen: string;
    email: string;
  };
}

const walletService = {
  getWallets: (userId: string) => api.get(`/vi-tien/nguoi-dung/${userId}`),
  
  getWalletById: (id: string) => api.get(`/vi-tien/${id}`),
  
  createWallet: (userId: string, data: Partial<Wallet>) => 
    api.post(`/vi-tien/nguoi-dung/${userId}`, data),
    
  updateWallet: (id: string, data: Partial<Wallet>) => 
    api.put(`/vi-tien/${id}`, data),
    
  deleteWallet: (id: string) => 
    api.delete(`/vi-tien/${id}`),
    
  // Membership
  getMembers: (viId: string) => 
    api.get(`/vi-tien/${viId}/thanh-vien`),
    
  addMember: (viId: string, email: string, role: string) => 
    api.post(`/vi-tien/${viId}/thanh-vien?email=${encodeURIComponent(email)}&vaiTro=${role}`),
    
  updateMemberRole: (viId: string, userId: string, role: string) => 
    api.put(`/vi-tien/${viId}/thanh-vien/${userId}?vaiTro=${role}`),
    
  removeMember: (viId: string, userId: string) => 
    api.delete(`/vi-tien/${viId}/thanh-vien/${userId}`),
};

export default walletService;
