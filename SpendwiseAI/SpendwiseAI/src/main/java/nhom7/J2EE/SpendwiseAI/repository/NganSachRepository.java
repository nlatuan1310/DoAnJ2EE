package nhom7.J2EE.SpendwiseAI.repository;

import nhom7.J2EE.SpendwiseAI.entity.NganSach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NganSachRepository extends JpaRepository<NganSach, UUID> {

    List<NganSach> findByNguoiDungId(UUID nguoiDungId);

    List<NganSach> findByNguoiDungIdAndDanhMucId(UUID nguoiDungId, Integer danhMucId);

    List<NganSach> findByViTienId(UUID viId);
}
