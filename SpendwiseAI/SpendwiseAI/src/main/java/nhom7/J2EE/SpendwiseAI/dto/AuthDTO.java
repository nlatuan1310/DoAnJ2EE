package nhom7.J2EE.SpendwiseAI.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

public class AuthDTO {

    // ===== REQUEST =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DangNhapRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String matKhau;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DangKyRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
        private String matKhau;

        @NotBlank(message = "Họ và tên không được để trống")
        private String hoVaTen;

        private String dienThoai;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class XacThucOtpRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mã OTP không được để trống")
        private String otp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoiMatKhauRequest {
        @NotBlank(message = "Mật khẩu cũ không được để trống")
        private String matKhauCu;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
        private String matKhauMoi;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuenMatKhauRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DatLaiMatKhauRequest {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mã OTP không được để trống")
        private String otp;

        @NotBlank(message = "Mật khẩu mới không được để trống")
        @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
        private String matKhauMoi;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class XacThuc2FARequest {
        @NotBlank(message = "Email không được để trống")
        private String email;

        @NotBlank(message = "Mã OTP không được để trống")
        private String otp;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Toggle2FARequest {
        private boolean enable;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateReportScheduledRequest {
        private boolean enabled;
        private String email;
    }

    // ===== RESPONSE =====

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private String loai; // Bearer
        private UUID id;
        private String email;
        private String hoVaTen;
        private String vaiTro;
        @com.fasterxml.jackson.annotation.JsonProperty("requires2FA")
        private boolean requires2FA;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NguoiDungResponse {
        private UUID id;
        private String email;
        private String hoVaTen;
        private String dienThoai;
        private String vaiTro;
        private String anhDaiDien;
        private String tienTe;
        @com.fasterxml.jackson.annotation.JsonProperty("is2faEnabled")
        private boolean is2faEnabled;

        @com.fasterxml.jackson.annotation.JsonProperty("isScheduledReportsEnabled")
        private boolean isScheduledReportsEnabled;

        private String scheduledReportEmail;
    }
}
