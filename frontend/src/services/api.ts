import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== JWT Interceptor =====
// Tự động gắn Authorization header cho mọi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ===== Response interceptor — redirect to login on 401 =====
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Chỉ redirect nếu không đang ở trang login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== User ID Utilities =====

/**
 * Lấy ID người dùng hiện tại từ localStorage.
 * Trả về chuỗi UUID hoặc chuỗi rỗng nếu chưa đăng nhập.
 */
export function getCurrentUserId(): string {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      return user.id || '';
    } catch {
      return '';
    }
  }
  return '';
}

/**
 * Lấy ví mặc định (ví đầu tiên) của user.
 * Dùng cho trường hợp không chọn ví cụ thể.
 */
export async function getDefaultViId(): Promise<string> {
  const uid = getCurrentUserId();
  if (!uid) return '';
  try {
    const res = await api.get(`/vi-tien/nguoi-dung/${uid}`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0].id;
    }
  } catch {
    // fallback
  }
  return '';
}

// ===== Category & Tag API (dùng cho Categories.tsx) =====

export const danhMucApi = {
  getAll: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/danh-muc/nguoi-dung/${uid}`);
  },

  getByLoai: (loai: 'thu' | 'chi', nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/danh-muc/nguoi-dung/${uid}/loai/${loai}`);
  },

  create: (data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/danh-muc/nguoi-dung/${uid}`, data);
  },

  update: (id: number, data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.put(`/danh-muc/${id}/nguoi-dung/${uid}`, data);
  },

  delete: (id: number, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.delete(`/danh-muc/${id}/nguoi-dung/${uid}`);
  },
};

export const theTagApi = {
  getAll: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/the-tag/nguoi-dung/${uid}`);
  },

  create: (data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/the-tag/nguoi-dung/${uid}`, data);
  },

  update: (id: number, data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.put(`/the-tag/${id}/nguoi-dung/${uid}`, data);
  },

  delete: (id: number, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.delete(`/the-tag/${id}/nguoi-dung/${uid}`);
  },
};

// ===== Auto-Categorization API (AI phân loại tự động) =====

export const autoCategorizeApi = {
  /** Gợi ý danh mục từ mô tả giao dịch (preview, chưa lưu) */
  suggestCategory: (data: { moTa: string; loai: string }, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/giao-dich/goi-y-danh-muc?nguoiDungId=${uid}`, data);
  },

  /** Tạo giao dịch mới với AI tự động phân loại danh mục */
  createWithAutoCategory: (viId: string, data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/giao-dich/tao-tu-dong?nguoiDungId=${uid}&viId=${viId}`, data);
  },
};

// ===== RAG Financial Advisor API (Cố vấn tài chính AI – Ollama/Llama) =====

export const financialAdvisorApi = {
  /** Gửi câu hỏi cho cố vấn AI */
  askQuestion: (data: { cauHoi: string }) =>
    api.post('/co-van-ai/hoi', data),

  /** Lấy lịch sử hội thoại */
  getHistory: () =>
    api.get('/co-van-ai/lich-su'),

  /** Xóa một câu hỏi trong lịch sử */
  deleteHistory: (id: string) =>
    api.delete(`/co-van-ai/lich-su/${id}`),
};


// ===== Statistics API (Thống kê - dùng cho Analytics.tsx) =====

export const thongKeApi = {
  getCategoryStats: (start: string, end: string, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/thong-ke/category?nguoiDungId=${uid}&start=${start}&end=${end}`);
  },

  getTagStats: (start: string, end: string, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/thong-ke/tag?nguoiDungId=${uid}&start=${start}&end=${end}`);
  },

  getTrend: (start: string, end: string, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/thong-ke/trend?nguoiDungId=${uid}&start=${start}&end=${end}`);
  }
  };

// ===== Crypto & Investment API =====

export const cryptoApi = {
  /** Lấy danh mục đầu tư của người dùng */
  getPortfolio: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/crypto/danh-muc/nguoi-dung/${uid}`);
  },

  /** Lấy giá thị trường hiện tại (CoinGecko) */
  getMarketPrices: (symbols: string) => {
    return api.get(`/crypto/market-prices?symbols=${symbols}`);
  },

  /** Lấy danh sách các đồng coin được hỗ trợ */
  getAvailableAssets: () => {
    return api.get('/tai-san-crypto');
  },

  /** Thêm coin mới vào danh mục */
  addCoin: (taiSanId: string, data: any, nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.post(`/crypto/danh-muc/${uid}/${taiSanId}`, data);
  },

  /** Xóa coin khỏi danh mục */
  deleteCoin: (id: string) => {
    return api.delete(`/crypto/danh-muc/${id}`);
  },

  /** Lấy lịch sử giao dịch của một đồng coin trong danh mục */
  getTransactions: (danhMucId: string) => {
    return api.get(`/crypto/giao-dich/danh-muc/${danhMucId}`);
  },

  /** Ghi lệnh giao dịch mới (Mua/Bán) */
  addTransaction: (danhMucId: string, data: any) => {
    return api.post(`/crypto/giao-dich/${danhMucId}`, data);
  },

  /** Xóa một lệnh giao dịch */
  deleteTransaction: (id: string) => {
    return api.delete(`/crypto/giao-dich/${id}`);
  },
};

// ===== Wallet API (Vi Tien) =====

export const viTienApi = {
  /** Lấy danh sách ví của người dùng */
  getAll: (nguoiDungId?: string) => {
    const uid = nguoiDungId || getCurrentUserId();
    return api.get(`/vi-tien/nguoi-dung/${uid}`);
  },

  /** Lấy chi tiết một ví */
  getById: (id: string) => {
    return api.get(`/vi-tien/${id}`);

  },
};

export default api;
