package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "thanh_vien_vi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThanhVienVi {

    @EmbeddedId
    private ThanhVienViId id;

    @Column(name = "vai_tro")
    private String vaiTro; // owner, editor, viewer

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("viId")
    @JoinColumn(name = "vi_id")
    private ViTien viTien;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("nguoiDungId")
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThanhVienViId implements Serializable {

        @Column(name = "vi_id")
        private UUID viId;

        @Column(name = "nguoi_dung_id")
        private UUID nguoiDungId;
    }
}
