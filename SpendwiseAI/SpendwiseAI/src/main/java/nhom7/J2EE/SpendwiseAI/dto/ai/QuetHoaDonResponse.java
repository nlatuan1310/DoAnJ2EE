package nhom7.J2EE.SpendwiseAI.dto.ai;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO chứa kết quả phân tích hóa đơn từ Gemini AI.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuetHoaDonResponse {

    /** Tên cửa hàng / nhà cung cấp */
    private String tenCuaHang;

    /** Ngày giao dịch trên hóa đơn (dd/MM/yyyy) */
    private String ngayGiaoDich;

    /** Tổng tiền thanh toán */
    private BigDecimal tongTien;

    /** Danh sách sản phẩm / mặt hàng */
    private List<SanPham> danhSachSanPham;

    /** Ghi chú bổ sung (phương thức thanh toán, mã hóa đơn, ...) */
    private String ghiChu;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SanPham {
        private String tenSanPham;
        private Integer soLuong;
        private BigDecimal donGia;
        private BigDecimal thanhTien;
    }
}
