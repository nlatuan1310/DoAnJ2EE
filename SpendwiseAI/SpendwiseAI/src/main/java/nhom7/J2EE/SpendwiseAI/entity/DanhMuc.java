package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "danh_muc")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhMuc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "ten_danh_muc")
    private String tenDanhMuc;

    @Column(name = "loai")
    private String loai; // thu / chi

    @Column(name = "icon")
    private String icon;

    @Column(name = "mau_sac")
    private String mauSac;
}
