import api, { getCurrentUserId } from "./api";

/* ======== Interfaces ======== */

export interface LichSuTimKiem {
  id: string;
  tuKhoa: string;
  boLoc: string | null;
  ngayTao: string;
}

/* ======== API Calls ======== */

/**
 * Lấy 10 từ khoá tìm kiếm gần đây nhất.
 */
export async function layLichSuTimKiem(): Promise<LichSuTimKiem[]> {
  const uid = getCurrentUserId();
  const res = await api.get<LichSuTimKiem[]>(
    `/lich-su-tim-kiem/nguoi-dung/${uid}`
  );
  return res.data;
}

/**
 * Lưu từ khoá tìm kiếm.
 */
export async function luuLichSuTimKiem(tuKhoa: string): Promise<void> {
  const uid = getCurrentUserId();
  await api.post(`/lich-su-tim-kiem/nguoi-dung/${uid}?tuKhoa=${encodeURIComponent(tuKhoa)}`);
}

/**
 * Xoá 1 bản ghi lịch sử.
 */
export async function xoaLichSu(id: string): Promise<void> {
  await api.delete(`/lich-su-tim-kiem/${id}`);
}

/**
 * Xoá toàn bộ lịch sử tìm kiếm.
 */
export async function xoaTatCaLichSu(): Promise<void> {
  const uid = getCurrentUserId();
  await api.delete(`/lich-su-tim-kiem/nguoi-dung/${uid}/xoa-tat-ca`);
}
