package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.NguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, UUID> {

    Optional<NguoiDung> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByNgayTaoBetween(java.time.LocalDateTime tuNgay, java.time.LocalDateTime denNgay);

    @org.springframework.data.jpa.repository.Query("SELECT FUNCTION('TO_CHAR', nd.ngayTao, 'YYYY-MM'), COUNT(nd) FROM NguoiDung nd " +
            "WHERE nd.ngayTao >= :fromDate GROUP BY FUNCTION('TO_CHAR', nd.ngayTao, 'YYYY-MM') " +
            "ORDER BY FUNCTION('TO_CHAR', nd.ngayTao, 'YYYY-MM')")
    java.util.List<Object[]> countNguoiDungTheoThang(@org.springframework.data.repository.query.Param("fromDate") java.time.LocalDateTime fromDate);
}
