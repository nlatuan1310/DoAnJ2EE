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
    private final EmailService emailService;

    public AuthService(NguoiDungRepository nguoiDungRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtUtil jwtUtil,
                       CustomUserDetailsService userDetailsService,
                       EmailService emailService) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.emailService = emailService;
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
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra 2FA
        if (nguoiDung.is2faEnabled()) {
            // Tạo 6-digit OTP
            String otp = String.format("%06d", new java.util.Random().nextInt(999999));
            nguoiDung.setOtpCode(otp);
            nguoiDung.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
            nguoiDungRepository.save(nguoiDung);

            // Gửi mail
            String subject = "Mã xác nhận bảo mật 2 lớp (2FA)";
            String text = "Xin chào " + nguoiDung.getHoVaTen() + ",\n\n" +
                          "Mã OTP để đăng nhập vào tài khoản của bạn là: " + otp + "\n" +
                          "Mã này sẽ hết hạn sau 15 phút.\n\n" +
                          "Trân trọng,\nĐội ngũ Spendwise AI";
            emailService.guiEmail(nguoiDung.getEmail(), subject, text);

            return AuthDTO.AuthResponse.builder()
                    .email(nguoiDung.getEmail())
                    .requires2FA(true)
                    .build();
        }

        // Tạo token nếu không yêu cầu 2FA
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Map<String, Object> claims = new HashMap<>();
        claims.put("vaiTro", nguoiDung.getVaiTro());
        String token = jwtUtil.generateToken(userDetails, claims);

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .loai("Bearer")
                .email(nguoiDung.getEmail())
                .hoVaTen(nguoiDung.getHoVaTen())
                .vaiTro(nguoiDung.getVaiTro())
                .requires2FA(false)
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
                .is2faEnabled(nguoiDung.is2faEnabled())
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

    public void quenMatKhau(AuthDTO.QuenMatKhauRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này"));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        // Cập nhật OTP vào DB (hết hạn sau 15 phút)
        nguoiDung.setOtpCode(otp);
        nguoiDung.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        nguoiDungRepository.save(nguoiDung);

        // Gửi mail
        String subject = "Mã xác nhận quên mật khẩu";
        String text = "Xin chào " + nguoiDung.getHoVaTen() + ",\n\n" +
                      "Mã OTP để đặt lại mật khẩu của bạn là: " + otp + "\n" +
                      "Mã này sẽ hết hạn sau 15 phút.\n\n" +
                      "Trân trọng,\nĐội ngũ Spendwise AI";
        emailService.guiEmail(nguoiDung.getEmail(), subject, text);
    }

    public void xacThucOtp(AuthDTO.XacThucOtpRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này"));

        if (nguoiDung.getOtpCode() == null || !nguoiDung.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        if (nguoiDung.getOtpExpiry() != null && nguoiDung.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }
    }

    public void datLaiMatKhau(AuthDTO.DatLaiMatKhauRequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với email này"));

        if (nguoiDung.getOtpCode() == null || !nguoiDung.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        if (nguoiDung.getOtpExpiry() != null && nguoiDung.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        // Cập nhật mật khẩu mới và xóa OTP
        nguoiDung.setMatKhauHash(passwordEncoder.encode(request.getMatKhauMoi()));
        nguoiDung.setOtpCode(null);
        nguoiDung.setOtpExpiry(null);
        nguoiDungRepository.save(nguoiDung);
    }

    public AuthDTO.AuthResponse xacThuc2FA(AuthDTO.XacThuc2FARequest request) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Kiểm tra OTP
        if (nguoiDung.getOtpCode() == null || !nguoiDung.getOtpCode().equals(request.getOtp())) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        if (nguoiDung.getOtpExpiry() != null && nguoiDung.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        // Xóa OTP sau khi xác thực thành công
        nguoiDung.setOtpCode(null);
        nguoiDung.setOtpExpiry(null);
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
                .requires2FA(false)
                .build();
    }

    public void toggle2FA(String email, boolean enable) {
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        nguoiDung.set2faEnabled(enable);
        nguoiDungRepository.save(nguoiDung);
    }
}
