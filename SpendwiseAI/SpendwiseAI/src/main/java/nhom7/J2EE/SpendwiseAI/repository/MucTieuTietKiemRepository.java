package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.MucTieuTietKiem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MucTieuTietKiemRepository extends JpaRepository<MucTieuTietKiem, UUID> {

    List<MucTieuTietKiem> findByNguoiDungId(UUID nguoiDungId);
}
