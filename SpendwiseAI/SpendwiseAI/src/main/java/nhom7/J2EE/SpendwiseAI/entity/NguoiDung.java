package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nguoi_dung")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String email;

    @Column(name = "mat_khau_hash", columnDefinition = "TEXT")
    private String matKhauHash;

    @Column(name = "ho_va_ten")
    private String hoVaTen;

    @Column(name = "anh_dai_dien", columnDefinition = "TEXT")
    private String anhDaiDien;

    @Column(name = "dien_thoai")
    private String dienThoai;

    @Column(name = "vai_tro")
    private String vaiTro; // admin | user

    @Column(name = "tien_te")
    private String tienTe;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @Column(name = "otp_code")
    private String otpCode;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    @Column(name = "is_2fa_enabled")
    private boolean is2faEnabled;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
