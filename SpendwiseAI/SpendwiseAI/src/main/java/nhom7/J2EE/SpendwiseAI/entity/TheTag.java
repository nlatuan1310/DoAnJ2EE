package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "the_tag")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nguoi_dung_id")
    private NguoiDung nguoiDung;

    @Column(name = "ten_tag")
    private String tenTag;
}
