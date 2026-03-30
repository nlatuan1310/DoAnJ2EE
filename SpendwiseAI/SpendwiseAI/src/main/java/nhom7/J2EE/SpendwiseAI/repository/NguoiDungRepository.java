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

    java.util.List<NguoiDung> findByIsScheduledReportsEnabledTrue();
}
