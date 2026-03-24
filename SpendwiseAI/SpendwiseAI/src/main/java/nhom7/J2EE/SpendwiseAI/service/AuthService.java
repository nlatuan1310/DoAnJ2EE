package nhom7.J2EE.SpendwiseAI.service;

import nhom7.J2EE.SpendwiseAI.config.JwtUtil;
import nhom7.J2EE.SpendwiseAI.dto.AuthDTO;
import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import nhom7.J2EE.SpendwiseAI.repository.NguoiDungRepository;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public AuthService(NguoiDungRepository nguoiDungRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       CustomUserDetailsService userDetailsService) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    public AuthDTO.AuthResponse dangKy(AuthDTO.DangKyRequest request) {
        // Kiểm tra email đã tồn tại chưa
        if (nguoiDungRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng: " + request.getEmail());
        }

        // Tạo user mới
        NguoiDung nguoiDung = NguoiDung.builder()
                .email(request.getEmail())
                .matKhauHash(passwordEncoder.encode(request.getMatKhau()))
                .hoVaTen(request.getHoVaTen())
                .dienThoai(request.getDienThoai())
                .vaiTro("user")
                .tienTe("VND")
                .ngayTao(LocalDateTime.now())
                .build();

        nguoiDungRepository.save(nguoiDung);

        // Tạo token
        UserDetails userDetails = userDetailsService.loadUserByUsername(nguoiDung.getEmail());
        Map<String, Object> claims = new HashMap<>();
        claims.put("vaiTro", nguoiDung.getVaiTro());
        String token = jwtUtil.generateToken(userDetails, claims);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .loai("Bearer")
                .email(nguoiDung.getEmail())
                .hoVaTen(nguoiDung.getHoVaTen())
                .vaiTro(nguoiDung.getVaiTro())
                .build();
    }

    public AuthDTO.AuthResponse dangNhap(AuthDTO.DangNhapRequest request) {
        // Xác thực
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(), request.getMatKhau()));

        // Lấy thông tin user
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Tạo token
        Map<String, Object> claims = new HashMap<>();
        claims.put("vaiTro", nguoiDung.getVaiTro());
        String token = jwtUtil.generateToken(userDetails, claims);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .loai("Bearer")
                .email(nguoiDung.getEmail())
                .hoVaTen(nguoiDung.getHoVaTen())
                .vaiTro(nguoiDung.getVaiTro())
                .build();
    }

    public AuthDTO.NguoiDungResponse getMe(String email) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return AuthDTO.NguoiDungResponse.builder()
                .id(nguoiDung.getId())
                .email(nguoiDung.getEmail())
                .hoVaTen(nguoiDung.getHoVaTen())
                .dienThoai(nguoiDung.getDienThoai())
                .vaiTro(nguoiDung.getVaiTro())
                .anhDaiDien(nguoiDung.getAnhDaiDien())
                .tienTe(nguoiDung.getTienTe())
                .build();
    }

    public void doiMatKhau(String email, AuthDTO.DoiMatKhauRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getMatKhauCu(), nguoiDung.getMatKhauHash())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        // Cập nhật mật khẩu mới
        nguoiDung.setMatKhauHash(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDungRepository.save(nguoiDung);
    }
}
