package nhom7.J2EE.SpendwiseAI.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

public class ThongKeDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummary {
        private Integer danhMucId;
        private String tenDanhMuc;
        private String mauSac;
        private String icon;
        private BigDecimal tongTien;
        private Double phanTram;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TagSummary {
        private Integer tagId;
        private String tenTag;
        private BigDecimal tongTien;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ComparisonResponse {
        private String label; // "Tháng này" vs "Tháng trước"
        private BigDecimal value;
        private Double growthRate; // % tăng trưởng
    }
}
