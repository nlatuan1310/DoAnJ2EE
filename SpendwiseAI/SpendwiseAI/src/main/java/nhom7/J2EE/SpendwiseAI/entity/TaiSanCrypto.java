package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tai_san_crypto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiSanCrypto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "ky_hieu")
    private String kyHieu;

    @Column(name = "ten")
    private String ten;
}
