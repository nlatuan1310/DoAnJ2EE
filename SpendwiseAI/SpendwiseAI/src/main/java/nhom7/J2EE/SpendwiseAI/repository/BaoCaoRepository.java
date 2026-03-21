package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.BaoCao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BaoCaoRepository extends JpaRepository<BaoCao, UUID> {

    List<BaoCao> findByNguoiDungIdOrderByNgayTaoDesc(UUID nguoiDungId);
}
