package nhom7.J2EE.SpendwiseAI.dto.ai;

import lombok.*;

/**
 * DTO cho chức năng Phân loại Chi tiêu Tự động (Auto-Categorization).
 */
public class AutoCategorizeDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuggestRequest {
        /** Mô tả giao dịch (vd: "Grab taxi đi làm") */
        private String moTa;
        /** Loại giao dịch: income / expense */
        private String loai;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SuggestResponse {
        /** ID danh mục được AI gợi ý (null nếu không chắc chắn) */
        private Integer danhMucId;
        /** Tên danh mục được AI gợi ý */
        private String tenDanhMuc;
        /** Độ tin cậy (0.0 - 1.0) */
        private Double doTinCay;
    }
}
