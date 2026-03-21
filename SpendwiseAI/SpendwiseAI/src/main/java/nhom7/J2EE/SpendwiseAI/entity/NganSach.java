package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "ngan_sach")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NganSach {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vi_id")
    private ViTien viTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "danh_muc_id")
    private DanhMuc danhMuc;

    @Column(name = "gioi_han_tien")
    private BigDecimal gioiHanTien;

    @Column(name = "chu_ky")
    private String chuKy; // weekly / monthly

    @Column(name = "ngay_bat_dau")
    private LocalDate ngayBatDau;

    @Column(name = "ngay_ket_thuc")
    private LocalDate ngayKetThuc;
}
