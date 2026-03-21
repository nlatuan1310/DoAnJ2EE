package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.DongGopTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DongGopTietKiemRepository extends JpaRepository<DongGopTietKiem, UUID> {

    List<DongGopTietKiem> findByMucTieuId(UUID mucTieuId);
}
