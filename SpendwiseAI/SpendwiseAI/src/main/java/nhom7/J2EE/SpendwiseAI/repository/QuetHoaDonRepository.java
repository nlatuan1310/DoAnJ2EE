package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.QuetHoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuetHoaDonRepository extends JpaRepository<QuetHoaDon, UUID> {

    List<QuetHoaDon> findByNguoiDungId(UUID nguoiDungId);
}
