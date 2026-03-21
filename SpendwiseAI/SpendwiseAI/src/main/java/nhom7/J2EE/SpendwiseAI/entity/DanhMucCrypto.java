package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "danh_muc_crypto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMucCrypto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tai_san_id")
    private TaiSanCrypto taiSan;

    @Column(name = "so_luong")
    private BigDecimal soLuong;

    @Column(name = "gia_mua_trung_binh")
    private BigDecimal giaMuaTrungBinh;

    @Column(name = "dia_chi_vi", columnDefinition = "TEXT")
    private String diaChiVi;
}
