import api, { getCurrentUserId, getDefaultViId } from "./api";
import { viTienApi } from "./walletService";

// ===== TYPES khớp Backend Entity =====
export interface MucTieuTietKiem {
  id: string;
  tenMucTieu: string;
  soTienMucTieu: number;
  soTienHienTai: number;
  ngayMucTieu: string;
  ngayTao: string;
  nguoiDung?: { id: string; hoVaTen: string };
  viTien?: { id: string; tenVi: string };
}

export interface DongGopTietKiem {
  id: string;
  soTien: number;
  ngayTao: string;
}

export interface ViTien {
  id: string;
  tenVi: string;
  soDu: number;
  tienTe: string;
}

// ===== API CALLS =====

/** Lấy danh sách ví tiền theo userId */
export async function getWallets(userId?: string): Promise<ViTien[]> {
  const uid = userId || getCurrentUserId();
  const res = await viTienApi.getAllAccessible(uid);
  return res.data;
}

/** Lấy danh sách mục tiêu theo userId */
export async function getGoals(userId?: string): Promise<MucTieuTietKiem[]> {
  const uid = userId || getCurrentUserId();
  const res = await api.get<MucTieuTietKiem[]>(
    `/muc-tieu-tiet-kiem/nguoi-dung/${uid}`
  );
  return res.data;
}

/** Tạo mục tiêu mới */
export async function createGoal(
  viId?: string,
  data?: Partial<MucTieuTietKiem>
): Promise<MucTieuTietKiem> {
  const uid = getCurrentUserId();
  const vid = viId || await getDefaultViId();
  const res = await api.post<MucTieuTietKiem>(
    `/muc-tieu-tiet-kiem?nguoiDungId=${uid}&viId=${vid}`,
    data
  );
  return res.data;
}

/** Đóng góp tiền vào mục tiêu */
export async function contributeToGoal(
  mucTieuId: string,
  soTien: number
): Promise<DongGopTietKiem> {
  const res = await api.post<DongGopTietKiem>(
    `/muc-tieu-tiet-kiem/${mucTieuId}/dong-gop?soTien=${soTien}`
  );
  return res.data;
}

/** Lấy lịch sử đóng góp cho 1 mục tiêu */
export async function getContributions(
  mucTieuId: string
): Promise<DongGopTietKiem[]> {
  const res = await api.get<DongGopTietKiem[]>(
    `/muc-tieu-tiet-kiem/${mucTieuId}/dong-gop`
  );
  return res.data;
}

/** Xóa mục tiêu */
export async function deleteGoal(mucTieuId: string): Promise<void> {
  await api.delete(`/muc-tieu-tiet-kiem/${mucTieuId}`);
}
