package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.GiaoDichTags;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GiaoDichTagsRepository extends JpaRepository<GiaoDichTags, GiaoDichTags.GiaoDichTagsId> {

    List<GiaoDichTags> findByIdGiaoDichId(UUID giaoDichId);

    List<GiaoDichTags> findByIdTagId(Integer tagId);

    @org.springframework.data.jpa.repository.Query("SELECT t.id, t.tenTag, SUM(gd.soTien) " +
            "FROM GiaoDich gd JOIN GiaoDichTags gdt ON gd.id = gdt.giaoDich.id JOIN TheTag t ON gdt.theTag.id = t.id " +
            "WHERE gd.nguoiDung.id = :nguoiDungId AND gd.ngayGiaoDich BETWEEN :tuNgay AND :denNgay AND gd.loai = 'expense' " +
            "GROUP BY t.id, t.tenTag")
    List<Object[]> thongKeTheoTag(java.util.UUID nguoiDungId, java.time.LocalDateTime tuNgay, java.time.LocalDateTime denNgay);
}
