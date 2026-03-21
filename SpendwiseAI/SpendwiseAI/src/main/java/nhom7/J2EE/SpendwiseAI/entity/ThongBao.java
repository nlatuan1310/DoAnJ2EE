package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "thong_bao")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "tieu_de")
    private String tieuDe;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "loai")
    private String loai;

    @Column(name = "da_doc")
    private Boolean daDoc;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
