package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.CanhBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CanhBaoRepository extends JpaRepository<CanhBao, UUID> {

    List<CanhBao> findByNguoiDungId(UUID nguoiDungId);

    List<CanhBao> findByNguoiDungIdAndDaDoc(UUID nguoiDungId, Boolean daDoc);
}
