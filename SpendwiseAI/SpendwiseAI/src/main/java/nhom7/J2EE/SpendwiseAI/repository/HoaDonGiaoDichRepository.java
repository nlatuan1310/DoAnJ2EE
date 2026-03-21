package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.HoaDonGiaoDich;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HoaDonGiaoDichRepository extends JpaRepository<HoaDonGiaoDich, UUID> {

    List<HoaDonGiaoDich> findByGiaoDichId(UUID giaoDichId);
}
