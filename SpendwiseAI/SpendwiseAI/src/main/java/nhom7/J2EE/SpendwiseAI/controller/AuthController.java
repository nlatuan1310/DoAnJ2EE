package nhom7.J2EE.SpendwiseAI.controller;

import jakarta.validation.Valid;
import nhom7.J2EE.SpendwiseAI.dto.AuthDTO;
import nhom7.J2EE.SpendwiseAI.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/dang-ky")
    public ResponseEntity<AuthDTO.AuthResponse> dangKy(@Valid @RequestBody AuthDTO.DangKyRequest request) {
        return ResponseEntity.ok(authService.dangKy(request));
    }

    @PostMapping("/dang-nhap")
    public ResponseEntity<AuthDTO.AuthResponse> dangNhap(@Valid @RequestBody AuthDTO.DangNhapRequest request) {
        return ResponseEntity.ok(authService.dangNhap(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthDTO.NguoiDungResponse> getMe(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(authService.getMe(email));
    }

    @PostMapping("/doi-mat-khau")
    public ResponseEntity<Map<String, String>> doiMatKhau(
            Authentication authentication,
            @Valid @RequestBody AuthDTO.DoiMatKhauRequest request) {
        String email = authentication.getName();
        authService.doiMatKhau(email, request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }

    @PostMapping("/quen-mat-khau")
    public ResponseEntity<Map<String, String>> quenMatKhau(@Valid @RequestBody AuthDTO.QuenMatKhauRequest request) {
        authService.quenMatKhau(request);
        return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi đến email của bạn"));
    }

    @PostMapping("/xac-thuc-otp")
    public ResponseEntity<Map<String, String>> xacThucOtp(@Valid @RequestBody AuthDTO.XacThucOtpRequest request) {
        authService.xacThucOtp(request);
        return ResponseEntity.ok(Map.of("message", "Xác thực OTP thành công"));
    }

    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<Map<String, String>> datLaiMatKhau(@Valid @RequestBody AuthDTO.DatLaiMatKhauRequest request) {
        authService.datLaiMatKhau(request);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    @PostMapping("/dang-xuat")
    public ResponseEntity<Map<String, String>> dangXuat() {
        // Với JWT, việc đăng xuất thực chất được xử lý ở Client (xóa token)
        // Endpoint này chỉ trả về thông báo xác nhận thành công
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
