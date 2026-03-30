package nhom7.J2EE.SpendwiseAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public class NganSachDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NganSachRequest {
        private UUID nguoiDungId;
        private UUID viId;
        private Integer danhMucId;
        
        private BigDecimal gioiHanTien;
        private String chuKy;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NganSachResponse {
        private UUID id;
        
        private DanhMucInner danhMuc;
        private ViTienInner viTien;
        
        private BigDecimal gioiHanTien;
        private String chuKy;
        private LocalDate ngayBatDau;
        private LocalDate ngayKetThuc;
        private BigDecimal spent;
        private Double progress;

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class ViTienInner {
            private UUID id;
            private String tenVi;
        }

        @Data
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class DanhMucInner {
            private Integer id;
            private String tenDanhMuc;
            private String icon;
            private String loai;
        }
    }
}
