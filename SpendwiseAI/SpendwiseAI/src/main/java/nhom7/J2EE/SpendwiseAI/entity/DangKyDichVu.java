package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dang_ky_dich_vu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DangKyDichVu {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vi_id")
    private ViTien viTien;

    @Column(name = "ten_dich_vu")
    private String tenDichVu;

    @Column(name = "so_tien")
    private BigDecimal soTien;

    @Column(name = "chu_ky_thanh_toan")
    private String chuKyThanhToan; // monthly / yearly

    @Column(name = "ngay_thanh_toan_tiep")
    private LocalDate ngayThanhToanTiep;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
