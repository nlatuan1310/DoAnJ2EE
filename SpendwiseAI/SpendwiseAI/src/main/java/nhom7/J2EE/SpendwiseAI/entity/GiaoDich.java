package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "giao_dich")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDich {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vi_id")
    private ViTien viTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "so_tien")
    private BigDecimal soTien;

    @Column(name = "loai")
    private String loai; // income / expense

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;

    @Column(name = "ngay_giao_dich")
    private LocalDateTime ngayGiaoDich;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
