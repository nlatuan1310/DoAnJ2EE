package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nhat_ky_admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhatKyAdmin {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private NguoiDung admin;

    @Column(name = "hanh_dong")
    private String hanhDong;

    @Column(name = "bang_du_lieu")
    private String bangDuLieu;

    @Column(name = "doi_tuong_id")
    private UUID doiTuongId;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
