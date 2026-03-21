package nhom7.J2EE.SpendwiseAI.entity;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "giao_dich_tags")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GiaoDichTags {

    @EmbeddedId
    private GiaoDichTagsId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("giaoDichId")
    @JoinColumn(name = "giao_dich_id")
    private GiaoDich giaoDich;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("tagId")
    @JoinColumn(name = "tag_id")
    private TheTag theTag;

    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GiaoDichTagsId implements Serializable {

        @Column(name = "giao_dich_id")
        private UUID giaoDichId;

        @Column(name = "tag_id")
        private Integer tagId;
    }
}
