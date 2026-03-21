package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "giao_dich_crypto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichCrypto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMucCrypto danhMucCrypto;

    @Column(name = "loai")
    private String loai; // buy / sell

    @Column(name = "so_luong")
    private BigDecimal soLuong;

    @Column(name = "gia")
    private BigDecimal gia;

    @Column(name = "ngay_giao_dich")
    private LocalDateTime ngayGiaoDich;
}
