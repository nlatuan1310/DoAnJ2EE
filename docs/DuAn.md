Nhóm tôi gồm 5 người đang muốn xây dựng một trang web SpendWise AI: Trợ lý Quản lý Tài chính Thông minh.Yêu cầu sử dụng spring boot, bao gồm các chức năng sau:
1. Dashboard Tổng quan & Trực quan hóa (Smart Dashboard)
2. Quét Hóa đơn Thông minh (AI OCR & YOLO)
3. Phân loại Chi tiêu Tự động (Auto-Categorization)
4. Hệ thống Quản lý Ngân sách (Budgeting)
5. Cố vấn Tài chính AI (RAG Financial Advisor)
6. Quản lý Hóa đơn định kỳ & Nhắc hẹn (Subscription Manager)
7. Tích hợp Quản lý Tài sản Crypto (Crypto Portfolio)
8. Chế độ Chia sẻ Ví & Nhóm (Shared Wallets)
9. Quản lý Mục tiêu Tiết kiệm (Saving Goals)
10. Hệ thống Thông báo & Cảnh báo Thông minh (Smart Alerts)
11. Tìm kiếm & Truy vấn Nâng cao (Advanced Search)
12. Xuất Báo cáo Đa định dạng (Reporting & Export)
13. Quản lý Tài khoản & Bảo mật (Security & Auth)
14. Quản lý Danh mục & Gắn thẻ Custom (Custom Categories & Tags)
15. Hệ thống Quản trị (Admin Portal)

và dưới đây là database diagram của dự án:
// ===============================
// CƠ SỞ DỮ LIỆU SPENDWISE AI
// Hệ thống quản lý tài chính cá nhân
// ===============================

Table nguoi_dung {
  id uuid [primary key]
  email varchar [unique]
  mat_khau_hash text
  ho_va_ten varchar
  anh_dai_dien text
  dien_thoai varchar
  vai_tro varchar [note: 'admin hoặc user']
  tien_te varchar
  ngay_tao timestamp
}




/////////////////////////////////////////////////
// HỆ THỐNG VÍ TIỀN
/////////////////////////////////////////////////

Table vi_tien {
  id uuid [primary key]
  ten_vi varchar
  chu_so_huu_id uuid
  tien_te varchar
  so_du decimal
  ngay_tao timestamp
}

Table thanh_vien_vi {
  vi_id uuid
  nguoi_dung_id uuid
  vai_tro varchar [note: 'owner, editor, viewer']
}

/////////////////////////////////////////////////
// DANH MỤC & TAG
/////////////////////////////////////////////////

Table danh_muc {
  id integer [primary key]
  nguoi_dung_id uuid
  ten_danh_muc varchar
  loai varchar [note: 'thu / chi']
  icon varchar
  mau_sac varchar
}

Table the_tag {
  id integer [primary key]
  nguoi_dung_id uuid
  ten_tag varchar
}

/////////////////////////////////////////////////
// GIAO DỊCH TÀI CHÍNH
/////////////////////////////////////////////////

Table giao_dich {
  id uuid [primary key]
  vi_id uuid
  nguoi_dung_id uuid
  so_tien decimal
  loai varchar [note: 'income / expense']
  danh_muc_id integer
  mo_ta text
  ngay_giao_dich timestamp
  ngay_tao timestamp
}

Table giao_dich_tags {
  giao_dich_id uuid
  tag_id integer
}

Table hoa_don_giao_dich {
  id uuid [primary key]
  giao_dich_id uuid
  anh_hoa_don text
  noi_dung_ocr text
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// QUÉT HÓA ĐƠN BẰNG AI
/////////////////////////////////////////////////

Table quet_hoa_don {
  id uuid [primary key]
  nguoi_dung_id uuid
  anh_hoa_don text
  noi_dung_ocr text
  tong_tien_ai decimal
  cua_hang_ai varchar
  ngay_hoa_don date
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// QUẢN LÝ NGÂN SÁCH
/////////////////////////////////////////////////

Table ngan_sach {
  id uuid [primary key]
  nguoi_dung_id uuid
  vi_id uuid
  danh_muc_id integer
  gioi_han_tien decimal
  chu_ky varchar [note: 'weekly / monthly']
  ngay_bat_dau date
  ngay_ket_thuc date
}

/////////////////////////////////////////////////
// QUẢN LÝ ĐĂNG KÝ DỊCH VỤ
/////////////////////////////////////////////////

Table dang_ky_dich_vu {
  id uuid [primary key]
  nguoi_dung_id uuid
  vi_id uuid
  ten_dich_vu varchar
  so_tien decimal
  chu_ky_thanh_toan varchar [note: 'monthly / yearly']
  ngay_thanh_toan_tiep date
  danh_muc_id integer
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// MỤC TIÊU TIẾT KIỆM
/////////////////////////////////////////////////

Table muc_tieu_tiet_kiem {
  id uuid [primary key]
  nguoi_dung_id uuid
  vi_id uuid
  ten_muc_tieu varchar
  so_tien_muc_tieu decimal
  so_tien_hien_tai decimal
  ngay_muc_tieu date
  ngay_tao timestamp
}

Table dong_gop_tiet_kiem {
  id uuid [primary key]
  muc_tieu_id uuid
  giao_dich_id uuid
  so_tien decimal
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// QUẢN LÝ CRYPTO
/////////////////////////////////////////////////

Table tai_san_crypto {
  id integer [primary key]
  ky_hieu varchar
  ten varchar
}

Table danh_muc_crypto {
  id uuid [primary key]
  nguoi_dung_id uuid
  tai_san_id integer
  so_luong decimal
  gia_mua_trung_binh decimal
  dia_chi_vi text
}

Table giao_dich_crypto {
  id uuid [primary key]
  danh_muc_id uuid
  loai varchar [note: 'buy / sell']
  so_luong decimal
  gia decimal
  ngay_giao_dich timestamp
}

/////////////////////////////////////////////////
// TRỢ LÝ AI
/////////////////////////////////////////////////

Table cau_hoi_ai {
  id uuid [primary key]
  nguoi_dung_id uuid
  cau_hoi text
  tra_loi text
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// CẢNH BÁO & THÔNG BÁO
/////////////////////////////////////////////////

Table canh_bao {
  id uuid [primary key]
  nguoi_dung_id uuid
  loai varchar
  noi_dung text
  da_doc boolean
  ngay_tao timestamp
}

Table thong_bao {
  id uuid [primary key]
  nguoi_dung_id uuid
  tieu_de varchar
  noi_dung text
  loai varchar
  da_doc boolean
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// BÁO CÁO
/////////////////////////////////////////////////

Table bao_cao {
  id uuid [primary key]
  nguoi_dung_id uuid
  loai varchar [note: 'monthly / yearly']
  dinh_dang varchar [note: 'pdf / csv']
  file_url text
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// LỊCH SỬ TÌM KIẾM
/////////////////////////////////////////////////

Table lich_su_tim_kiem {
  id uuid [primary key]
  nguoi_dung_id uuid
  tu_khoa text
  bo_loc json
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// NHẬT KÝ ADMIN
/////////////////////////////////////////////////

Table nhat_ky_admin {
  id uuid [primary key]
  admin_id uuid
  hanh_dong varchar
  bang_du_lieu varchar
  doi_tuong_id uuid
  ngay_tao timestamp
}

/////////////////////////////////////////////////
// QUAN HỆ GIỮA CÁC BẢNG
/////////////////////////////////////////////////

Ref: vi_tien.chu_so_huu_id > nguoi_dung.id
Ref: thanh_vien_vi.vi_id > vi_tien.id
Ref: thanh_vien_vi.nguoi_dung_id > nguoi_dung.id

Ref: danh_muc.nguoi_dung_id > nguoi_dung.id
Ref: the_tag.nguoi_dung_id > nguoi_dung.id

Ref: giao_dich.vi_id > vi_tien.id
Ref: giao_dich.nguoi_dung_id > nguoi_dung.id
Ref: giao_dich.danh_muc_id > danh_muc.id

Ref: giao_dich_tags.giao_dich_id > giao_dich.id
Ref: giao_dich_tags.tag_id > the_tag.id

Ref: hoa_don_giao_dich.giao_dich_id > giao_dich.id

Ref: quet_hoa_don.nguoi_dung_id > nguoi_dung.id

Ref: ngan_sach.nguoi_dung_id > nguoi_dung.id
Ref: ngan_sach.vi_id > vi_tien.id
Ref: ngan_sach.danh_muc_id > danh_muc.id

Ref: dang_ky_dich_vu.nguoi_dung_id > nguoi_dung.id
Ref: dang_ky_dich_vu.vi_id > vi_tien.id
Ref: dang_ky_dich_vu.danh_muc_id > danh_muc.id

Ref: muc_tieu_tiet_kiem.nguoi_dung_id > nguoi_dung.id
Ref: muc_tieu_tiet_kiem.vi_id > vi_tien.id

Ref: dong_gop_tiet_kiem.muc_tieu_id > muc_tieu_tiet_kiem.id
Ref: dong_gop_tiet_kiem.giao_dich_id > giao_dich.id

Ref: danh_muc_crypto.nguoi_dung_id > nguoi_dung.id
Ref: danh_muc_crypto.tai_san_id > tai_san_crypto.id

Ref: giao_dich_crypto.danh_muc_id > danh_muc_crypto.id

Ref: cau_hoi_ai.nguoi_dung_id > nguoi_dung.id

Ref: canh_bao.nguoi_dung_id > nguoi_dung.id
Ref: thong_bao.nguoi_dung_id > nguoi_dung.id

Ref: bao_cao.nguoi_dung_id > nguoi_dung.id

Ref: lich_su_tim_kiem.nguoi_dung_id > nguoi_dung.id

Ref: nhat_ky_admin.admin_id > nguoi_dung.id