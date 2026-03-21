package nhom7.J2EE.SpendwiseAI.dto;

import lombok.*;

public class AuthDTO {

    // ===== REQUEST =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DangNhapRequest {
        private String email;
        private String matKhau;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DangKyRequest {
        private String email;
        private String matKhau;
        private String hoVaTen;
        private String dienThoai;
    }

    // ===== RESPONSE =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String loai; // Bearer
        private String email;
        private String hoVaTen;
        private String vaiTro;
    }
}
