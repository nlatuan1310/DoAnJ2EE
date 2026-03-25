import api, { getCurrentUserId } from "./api";

/* ======== Interfaces ======== */

export interface DanhMuc {
  id: number;
  tenDanhMuc: string;
  mauSac?: string;
  icon?: string;
  loai?: string;
}

export interface GiaoDich {
  id: string;
  soTien: number;
  loai: "income" | "expense";
  moTa: string;
  ngayGiaoDich: string;
  ngayTao: string;
  danhMuc?: DanhMuc;
  viTien?: { id: string; tenVi: string };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // trang hiện tại (0-indexed)
}

export interface SearchParams {
  keyword?: string;
  loai?: string;
  tuNgay?: string;
  denNgay?: string;
  tuSoTien?: number;
  denSoTien?: number;
  danhMucId?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}

/* ======== API Calls ======== */

/**
 * Tìm kiếm nâng cao giao dịch (có phân trang)
 */
export async function timKiemNangCao(
  params: SearchParams
): Promise<PageResponse<GiaoDich>> {
  const uid = getCurrentUserId();
  const res = await api.get<PageResponse<GiaoDich>>("/giao-dich/tim-kiem", {
    params: { ...params, nguoiDungId: uid },
  });
  return res.data;
}

/**
 * Lấy danh sách danh mục (dùng cho dropdown Filter)
 */
export async function layDanhMuc(): Promise<DanhMuc[]> {
  const res = await api.get<DanhMuc[]>("/danh-muc");
  return res.data;
}
