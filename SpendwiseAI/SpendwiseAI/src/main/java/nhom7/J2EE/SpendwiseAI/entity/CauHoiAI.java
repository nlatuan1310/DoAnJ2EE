package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cau_hoi_ai")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CauHoiAI {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "cau_hoi", columnDefinition = "TEXT")
    private String cauHoi;

    @Column(name = "tra_loi", columnDefinition = "TEXT")
    private String traLoi;

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
