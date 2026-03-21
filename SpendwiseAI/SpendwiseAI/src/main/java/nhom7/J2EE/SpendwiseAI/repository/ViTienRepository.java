package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.ViTien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ViTienRepository extends JpaRepository<ViTien, UUID> {

    List<ViTien> findByChuSoHuuId(UUID chuSoHuuId);
}
