package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "lich_su_tim_kiem")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LichSuTimKiem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "tu_khoa", columnDefinition = "TEXT")
    private String tuKhoa;

    @Column(name = "bo_loc", columnDefinition = "TEXT")
    private String boLoc; // JSON string

    @Column(name = "ngay_tao")
    private LocalDateTime ngayTao;

    @PrePersist
    protected void onCreate() {
        ngayTao = LocalDateTime.now();
    }
}
