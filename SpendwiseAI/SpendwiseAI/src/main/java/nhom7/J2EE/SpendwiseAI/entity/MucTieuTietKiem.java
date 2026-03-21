package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "muc_tieu_tiet_kiem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MucTieuTietKiem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vi_id")
    private ViTien viTien;

    @Column(name = "ten_muc_tieu")
    private String tenMucTieu;

    @Column(name = "so_tien_muc_tieu")
    private BigDecimal soTienMucTieu;

    @Column(name = "so_tien_hien_tai")
    private BigDecimal soTienHienTai;

    @Column(name = "ngay_muc_tieu")
    private LocalDate ngayMucTieu;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
