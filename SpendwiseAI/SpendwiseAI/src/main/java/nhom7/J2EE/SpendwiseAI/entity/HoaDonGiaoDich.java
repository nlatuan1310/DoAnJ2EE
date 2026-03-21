package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "hoa_don_giao_dich")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoaDonGiaoDich {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "giao_dich_id")
    private GiaoDich giaoDich;

    @Column(name = "anh_hoa_don", columnDefinition = "TEXT")
    private String anhHoaDon;

    @Column(name = "noi_dung_ocr", columnDefinition = "TEXT")
    private String noiDungOcr;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
