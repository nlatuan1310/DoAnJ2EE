package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "vi_tien")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViTien {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "ten_vi")
    private String tenVi;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chu_so_huu_id")
    private NguoiDung chuSoHuu;

    @Column(name = "tien_te")
    private String tienTe;

    @Column(name = "so_du")
    private BigDecimal soDu;

    @Builder.Default
    @Column(name = "nhom")
    private Boolean nhom = false;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }

    @Transient
    private String vaiTro; // Role of current user in this wallet (OWNER, EDITOR, VIEWER)

    @Transient
    private String tenChuSoHuu;

    @Transient
    private Long soThanhVien;
}
