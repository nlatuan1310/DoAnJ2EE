package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "dong_gop_tiet_kiem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DongGopTietKiem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "muc_tieu_id")
    private MucTieuTietKiem mucTieu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "giao_dich_id")
    private GiaoDich giaoDich;

    @Column(name = "so_tien")
    private BigDecimal soTien;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
