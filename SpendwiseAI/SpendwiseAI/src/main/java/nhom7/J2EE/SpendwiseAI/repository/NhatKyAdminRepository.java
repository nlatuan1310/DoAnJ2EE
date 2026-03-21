package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.NhatKyAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NhatKyAdminRepository extends JpaRepository<NhatKyAdmin, UUID> {

    List<NhatKyAdmin> findByAdminIdOrderByNgayTaoDesc(UUID adminId);

    List<NhatKyAdmin> findByBangDuLieu(String bangDuLieu);
}
