import api, { getCurrentUserId } from "./api";

/* ======== Interfaces ======== */

export interface ThongBao {
  id: string;
  tieuDe: string;
  noiDung: string;
  loai: string;
  daDoc: boolean;
  ngayTao: string;
}

/* ======== API Calls ======== */

/** Lấy tất cả thông báo (mới nhất trước). */
export async function layThongBao(): Promise<ThongBao[]> {
  const uid = getCurrentUserId();
  const res = await api.get<ThongBao[]>(`/thong-bao/nguoi-dung/${uid}`);
  return res.data;
}

/** Đếm số thông báo chưa đọc. */
export async function demChuaDoc(): Promise<number> {
  const uid = getCurrentUserId();
  const res = await api.get<{ count: number }>(`/thong-bao/nguoi-dung/${uid}/chua-doc`);
  return res.data.count;
}

/** Đánh dấu 1 thông báo đã đọc. */
export async function danhDauDaDoc(id: string): Promise<void> {
  await api.put(`/thong-bao/${id}/da-doc`);
}

/** Đánh dấu tất cả đã đọc. */
export async function docTatCa(): Promise<void> {
  const uid = getCurrentUserId();
  await api.put(`/thong-bao/nguoi-dung/${uid}/doc-tat-ca`);
}
