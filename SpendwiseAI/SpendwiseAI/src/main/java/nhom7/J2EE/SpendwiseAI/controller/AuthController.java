package nhom7.J2EE.SpendwiseAI.controller;

import nhom7.J2EE.SpendwiseAI.dto.AuthDTO;
import nhom7.J2EE.SpendwiseAI.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/dang-ky")
    public ResponseEntity<AuthDTO.AuthResponse> dangKy(@RequestBody AuthDTO.DangKyRequest request) {
        return ResponseEntity.ok(authService.dangKy(request));
    }

    @PostMapping("/dang-nhap")
    public ResponseEntity<AuthDTO.AuthResponse> dangNhap(@RequestBody AuthDTO.DangNhapRequest request) {
        return ResponseEntity.ok(authService.dangNhap(request));
    }
}
