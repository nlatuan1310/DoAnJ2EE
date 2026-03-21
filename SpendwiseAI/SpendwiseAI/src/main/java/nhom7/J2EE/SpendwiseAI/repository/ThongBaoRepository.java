package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, UUID> {

    List<ThongBao> findByNguoiDungIdOrderByNgayTaoDesc(UUID nguoiDungId);

    List<ThongBao> findByNguoiDungIdAndDaDoc(UUID nguoiDungId, Boolean daDoc);
}
