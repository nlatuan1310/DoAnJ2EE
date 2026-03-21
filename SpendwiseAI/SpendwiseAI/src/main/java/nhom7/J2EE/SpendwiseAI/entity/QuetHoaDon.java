package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "quet_hoa_don")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuetHoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "anh_hoa_don", columnDefinition = "TEXT")
    private String anhHoaDon;

    @Column(name = "noi_dung_ocr", columnDefinition = "TEXT")
    private String noiDungOcr;

    @Column(name = "tong_tien_ai")
    private BigDecimal tongTienAi;

    @Column(name = "cua_hang_ai")
    private String cuaHangAi;

    @Column(name = "ngay_hoa_don")
    private LocalDate ngayHoaDon;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
