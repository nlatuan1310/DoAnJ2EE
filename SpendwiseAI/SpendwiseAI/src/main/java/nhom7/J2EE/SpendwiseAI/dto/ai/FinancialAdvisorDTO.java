package nhom7.J2EE.SpendwiseAI.dto.ai;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO cho tính năng Cố vấn Tài chính AI (RAG Financial Advisor).
 */
public class FinancialAdvisorDTO {

    /**
     * Request gửi câu hỏi cho cố vấn AI.
     */
    @Data
    public static class QuestionRequest {
        private String cauHoi;
    }

    /**
     * Response trả về từ cố vấn AI.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvisorResponse {
        private UUID id;
        private String cauHoi;
        private String traLoi;
        private LocalDateTime ngayTao;
    }

    /**
     * Context tài chính (internal) — được inject vào prompt.
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinancialContext {
        private BigDecimal tongThuNhap;       // Tổng thu nhập 30 ngày
        private BigDecimal tongChiTieu;       // Tổng chi tiêu 30 ngày
        private BigDecimal soDuTongVi;        // Tổng số dư tất cả ví
        private List<String> topChiTieu;      // Top danh mục chi tiêu nhiều nhất
        private List<String> nganSachInfo;    // Thông tin ngân sách
        private List<String> mucTieuInfo;     // Thông tin mục tiêu tiết kiệm
    }
}
